import { Injectable, ConflictException, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EstadoPrestamo, EstadoEjemplar, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrestamoDto } from './dto/create-prestamo.dto';
import { UpdatePrestamoDto } from './dto/update-prestamo.dto';

@Injectable()
export class PrestamoService {
    private readonly logger = new Logger(PrestamoService.name);

    constructor(private prisma: PrismaService) { }

    async create(createPrestamoDto: CreatePrestamoDto) {
        const MAX_LOANS = 7;

        try {
            return await this.prisma.$transaction(async (tx) => {
                // 1. Check Student
                const estudiante = await tx.estudiante.findUnique({
                    where: { estudianteId: createPrestamoDto.estudianteId },
                });

                if (!estudiante) throw new NotFoundException('Estudiante no encontrado');
                if (!estudiante.activo) {
                    throw new ConflictException(
                        'El estudiante no está activo para realizar préstamos (posible sanción).',
                    );
                }

                // 1.1 Check Librarian
                const bibliotecario = await tx.bibliotecario.findUnique({
                    where: { bibliotecarioId: createPrestamoDto.bibliotecarioId },
                });
                if (!bibliotecario) throw new NotFoundException('Bibliotecario no encontrado');

                // 2. Check student's current active loans
                const activeLoans = await tx.prestamo.findMany({
                    where: {
                        estudianteId: createPrestamoDto.estudianteId,
                        estadoPrestamo: EstadoPrestamo.ACTIVO,
                    },
                });

                if (activeLoans.length >= MAX_LOANS) {
                    throw new ConflictException(
                        `El estudiante ya tiene el máximo de ${MAX_LOANS} libros prestados.`,
                    );
                }

                // 2.1 Check for overdue loans
                const nowForOverdue = new Date();
                const overdueLoansCount = activeLoans.filter(l => l.fechaDevolucion && l.fechaDevolucion < nowForOverdue).length;

                if (overdueLoansCount >= 3) {
                    await tx.estudiante.update({
                        where: { estudianteId: createPrestamoDto.estudianteId },
                        data: { activo: false },
                    });
                    throw new ConflictException(
                        `El estudiante ha sido desactivado por tener ${overdueLoansCount} libros vencidos sin devolver.`,
                    );
                }

                // 3. Check if Exemplar is available with ROW LOCK
                const ejemplares = await tx.$queryRaw<any[]>`
                    SELECT * FROM "Ejemplar" 
                    WHERE "ejemplarId" = ${createPrestamoDto.ejemplarId} 
                    FOR UPDATE
                `;

                if (ejemplares.length === 0) throw new NotFoundException('Ejemplar no encontrado');
                const ejemplar = ejemplares[0];

                // Unit Model Check
                if (ejemplar.estado !== EstadoEjemplar.DISPONIBLE) {
                    throw new ConflictException(`El ejemplar no está disponible (Estado actual: ${ejemplar.estado}).`);
                }

                // 4. Create the loan and update status
                const now = new Date();
                const fechaLimite = new Date(createPrestamoDto.fechaLimite);

                if (isNaN(fechaLimite.getTime()) || fechaLimite < now) {
                    throw new BadRequestException('Fecha límite inválida.');
                }

                const fechaDevolucion = createPrestamoDto.fechaDevolucion
                    ? new Date(createPrestamoDto.fechaDevolucion)
                    : null;

                if (fechaDevolucion && fechaDevolucion < now) {
                    throw new BadRequestException('La fecha de devolución programada no puede ser en el pasado.');
                }

                // Update Unit State to PRESTADO
                await tx.ejemplar.update({
                    where: { ejemplarId: createPrestamoDto.ejemplarId },
                    data: {
                        estado: EstadoEjemplar.PRESTADO,
                    },
                });

                return await tx.prestamo.create({
                    data: {
                        estadoPrestamo: EstadoPrestamo.ACTIVO,
                        fechaPrestamo: now,
                        fechaLimite: fechaLimite,
                        fechaDevolucion: fechaDevolucion,
                        estudiante: { connect: { estudianteId: createPrestamoDto.estudianteId } },
                        bibliotecario: { connect: { bibliotecarioId: createPrestamoDto.bibliotecarioId } },
                        ejemplar: { connect: { ejemplarId: createPrestamoDto.ejemplarId } },
                    },
                    include: {
                        estudiante: true,
                        bibliotecario: true,
                        ejemplar: {
                            include: {
                                libro: true,
                            },
                        },
                    },
                });
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    findAll() {
        return this.prisma.prestamo.findMany({
            include: {
                estudiante: true,
                bibliotecario: true,
                ejemplar: {
                    include: {
                        libro: {
                            include: {
                                categorias: true,
                                editoriales: true,
                                autores: { include: { autor: true } }
                            }
                        },
                    },
                },
            },
        });
    }

    findByStudent(estudianteId: number) {
        return this.prisma.prestamo.findMany({
            where: { estudianteId },
            include: {
                estudiante: true,
                bibliotecario: true,
                ejemplar: {
                    include: {
                        libro: {
                            include: {
                                categorias: true,
                                editoriales: true,
                                autores: { include: { autor: true } }
                            }
                        },
                    },
                },
            },
            orderBy: { fechaPrestamo: 'desc' }
        });
    }

    async findOne(id: number) {
        const prestamo = await this.prisma.prestamo.findUnique({
            where: { prestamoId: id },
            include: {
                estudiante: true,
                bibliotecario: true,
                ejemplar: {
                    include: {
                        libro: {
                            include: {
                                categorias: true,
                                editoriales: true,
                                autores: { include: { autor: true } }
                            }
                        },
                    },
                },
            },
        });

        if (!prestamo) return null;

        // Lazy Expiration Check: If ACTIVO and Overdue -> PERDIDO
        if (prestamo.estadoPrestamo === EstadoPrestamo.ACTIVO && prestamo.fechaLimite < new Date()) {
            return await this.prisma.$transaction(async (tx) => {
                // Mark Exemplar as PERDIDO
                await tx.ejemplar.update({
                    where: { ejemplarId: prestamo.ejemplarId },
                    data: { estado: EstadoEjemplar.PERDIDO },
                });

                // Mark Student as inactive (Sanction)
                const updatedStudent = await tx.estudiante.update({
                    where: { estudianteId: prestamo.estudianteId },
                    data: { sanciones: { increment: 1 } },
                });

                if (updatedStudent.sanciones >= 3) {
                    await tx.estudiante.update({
                        where: { estudianteId: prestamo.estudianteId },
                        data: { activo: false },
                    });
                }

                // Update Loan to PERDIDO
                return await tx.prestamo.update({
                    where: { prestamoId: id },
                    data: { estadoPrestamo: EstadoPrestamo.PERDIDO },
                    include: {
                        estudiante: true,
                        bibliotecario: true,
                        ejemplar: {
                            include: {
                                libro: {
                                    include: {
                                        categorias: true,
                                        editoriales: true,
                                        autores: { include: { autor: true } }
                                    }
                                },
                            },
                        },
                    },
                });
            });
        }

        return prestamo;
    }

    async update(id: number, updatePrestamoDto: UpdatePrestamoDto) {
        try {
            return await this.prisma.$transaction(async (tx) => {
                const prestamo = await tx.prestamo.findUnique({
                    where: { prestamoId: id },
                });

                if (!prestamo) {
                    throw new NotFoundException(`Prestamo con ID ${id} no encontrado`);
                }

                const prevEstado = prestamo.estadoPrestamo;
                let nextEstado = updatePrestamoDto.estadoPrestamo;

                // Date validation and Auto-Status
                if (updatePrestamoDto.fechaLimite) {
                    const newFechaLim = new Date(updatePrestamoDto.fechaLimite);
                    if (newFechaLim < prestamo.fechaPrestamo) {
                        throw new BadRequestException('La fecha límite no puede ser anterior a la fecha de préstamo.');
                    }
                }

                if (updatePrestamoDto.fechaDevolucion) {
                    const newFechaDev = new Date(updatePrestamoDto.fechaDevolucion);
                    if (newFechaDev < prestamo.fechaPrestamo) {
                        throw new BadRequestException('La fecha de devolución no puede ser anterior a la fecha de préstamo.');
                    }
                    // If return date is provided, status implies DEVUELTO
                    nextEstado = EstadoPrestamo.DEVUELTO;
                }

                // If explicitly setting to DEVUELTO without date, use NOW
                const fechaDevolucion = updatePrestamoDto.fechaDevolucion
                    ? new Date(updatePrestamoDto.fechaDevolucion)
                    : (nextEstado === EstadoPrestamo.DEVUELTO ? new Date() : undefined);

                const data: Prisma.PrestamoUpdateInput = {
                    ...updatePrestamoDto,
                    estadoPrestamo: nextEstado, // Priority to calculated state
                    fechaDevolucion: fechaDevolucion,
                };

                // Status Transitions
                if (nextEstado && nextEstado !== prevEstado) {
                    const ejemplar = await tx.ejemplar.findUnique({
                        where: { ejemplarId: prestamo.ejemplarId },
                    });

                    if (!ejemplar) throw new NotFoundException('Ejemplar no encontrado');

                    // Handle Return (from ACTIVO or PERDIDO)
                    if (nextEstado === EstadoPrestamo.DEVUELTO) {
                        // Mark Unit as DISPONIBLE
                        await tx.ejemplar.update({
                            where: { ejemplarId: ejemplar.ejemplarId },
                            data: { estado: EstadoEjemplar.DISPONIBLE },
                        });

                        // Check Late Return
                        const fechaRetorno = (data.fechaDevolucion as Date) || new Date();
                        if (prestamo.fechaLimite && fechaRetorno > prestamo.fechaLimite) {
                            const est = await tx.estudiante.update({
                                where: { estudianteId: prestamo.estudianteId },
                                data: { sanciones: { increment: 1 } },
                            });
                            // If previously deactivated due to PERDIDO or Sanctions, we might want to check 
                            // if they can be reactivated, but business logic is complex there. 
                            // For now, we simply record the sanction increment.
                        }
                    }
                    // FROM ACTIVO to PERDIDO
                    else if (prevEstado === EstadoPrestamo.ACTIVO && nextEstado === EstadoPrestamo.PERDIDO) {
                        // Mark Unit as PERDIDO
                        await tx.ejemplar.update({
                            where: { ejemplarId: ejemplar.ejemplarId },
                            data: { estado: EstadoEjemplar.PERDIDO },
                        });
                        await tx.estudiante.update({
                            where: { estudianteId: prestamo.estudianteId },
                            data: { activo: false },
                        });
                    }
                    // TO ACTIVO (Undo)
                    else if (nextEstado === EstadoPrestamo.ACTIVO) {
                        if (ejemplar.estado === EstadoEjemplar.PRESTADO) {
                            throw new ConflictException('El ejemplar ya está prestado (posiblemente a otro usuario).');
                        }

                        await tx.ejemplar.update({
                            where: { ejemplarId: ejemplar.ejemplarId },
                            data: { estado: EstadoEjemplar.PRESTADO },
                        });
                    }
                }

                return await tx.prestamo.update({
                    where: { prestamoId: id },
                    data,
                    include: {
                        estudiante: true,
                        bibliotecario: true,
                        ejemplar: {
                            include: {
                                libro: {
                                    include: {
                                        categorias: true,
                                        editoriales: true,
                                        autores: { include: { autor: true } }
                                    }
                                },
                            },
                        },
                    },
                });
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    remove(id: number) {
        throw new BadRequestException('No se permite eliminar préstamos físicamente. Use el cambio de estado.');
    }

    private handlePrismaError(error: any) {
        if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
            throw error;
        }
        if (error.code === 'P2002') {
            throw new ConflictException(`Conflicto de unicidad en el campo: ${error.meta?.target?.join(', ')}`);
        }
        if (error.code === 'P2003') {
            throw new BadRequestException(`Error de relación. Algún ID proporcionado no existe en el sistema.`);
        }
        if (error.code === 'P2025') {
            throw new NotFoundException(`No se encontró el registro solicitado.`);
        }
        throw error;
    }

    @Cron(CronExpression.EVERY_MINUTE) // Check every minute for testing. Change to EVERY_HOUR for production.
    async handleOverdueLoans() {
        this.logger.debug('Checking for overdue loans...');
        const now = new Date();

        const overdueLoans = await this.prisma.prestamo.findMany({
            where: {
                estadoPrestamo: EstadoPrestamo.ACTIVO,
                fechaLimite: {
                    lt: now,
                },
            },
        });

        if (overdueLoans.length === 0) {
            this.logger.debug('No overdue loans found.');
            return;
        }

        this.logger.log(`Found ${overdueLoans.length} overdue loans. Processing...`);

        for (const loan of overdueLoans) {
            try {
                await this.prisma.$transaction(async (tx) => {
                    // Mark Exemplar as PERDIDO
                    await tx.ejemplar.update({
                        where: { ejemplarId: loan.ejemplarId },
                        data: { estado: EstadoEjemplar.PERDIDO },
                    });

                    // Mark Student as inactive (Sanction)
                    const updatedStudent = await tx.estudiante.update({
                        where: { estudianteId: loan.estudianteId },
                        data: { sanciones: { increment: 1 } },
                    });

                    if (updatedStudent.sanciones >= 3) {
                        await tx.estudiante.update({
                            where: { estudianteId: loan.estudianteId },
                            data: { activo: false },
                        });
                        this.logger.log(`Student ${loan.estudianteId} deactivated due to accumulating ${updatedStudent.sanciones} sanctions.`);
                    }

                    // Update Loan to PERDIDO
                    await tx.prestamo.update({
                        where: { prestamoId: loan.prestamoId },
                        data: { estadoPrestamo: EstadoPrestamo.PERDIDO },
                    });
                });
                this.logger.log(`Loan ${loan.prestamoId} marked as PERDIDO. Student ${loan.estudianteId} sanctioned.`);
            } catch (error) {
                this.logger.error(`Failed to process overdue loan ${loan.prestamoId}`, error.stack);
            }
        }
    }
}

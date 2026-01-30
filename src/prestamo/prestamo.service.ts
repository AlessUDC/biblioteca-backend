import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { EstadoPrestamo, EstadoEjemplar, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrestamoDto } from './dto/create-prestamo.dto';
import { UpdatePrestamoDto } from './dto/update-prestamo.dto';

@Injectable()
export class PrestamoService {
    constructor(private prisma: PrismaService) { }

    async create(createPrestamoDto: CreatePrestamoDto) {
        const MAX_LOANS = 7;

        return this.prisma.$transaction(async (tx) => {
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

            return tx.prestamo.create({
                data: {
                    estadoPrestamo: EstadoPrestamo.ACTIVO,
                    fechaPrestamo: now,
                    fechaLimite: fechaLimite,
                    fechaDevolucion: fechaDevolucion,
                    estudiante: { connect: { estudianteId: createPrestamoDto.estudianteId } },
                    bibliotecario: { connect: { bibliotecarioId: createPrestamoDto.bibliotecarioId } },
                    ejemplar: { connect: { ejemplarId: createPrestamoDto.ejemplarId } },
                },
            });
        });
    }

    findAll() {
        return this.prisma.prestamo.findMany({
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
    }

    findOne(id: number) {
        return this.prisma.prestamo.findUnique({
            where: { prestamoId: id },
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
    }

    async update(id: number, updatePrestamoDto: UpdatePrestamoDto) {
        return this.prisma.$transaction(async (tx) => {
            const prestamo = await tx.prestamo.findUnique({
                where: { prestamoId: id },
            });

            if (!prestamo) {
                throw new NotFoundException(`Prestamo con ID ${id} no encontrado`);
            }

            const prevEstado = prestamo.estadoPrestamo;
            const nextEstado = updatePrestamoDto.estadoPrestamo;

            // Date validation (omitted for brevity, same as before roughly)
            if (updatePrestamoDto.fechaDevolucion) {
                const newFechaDev = new Date(updatePrestamoDto.fechaDevolucion);
                if (newFechaDev < prestamo.fechaPrestamo) {
                    throw new BadRequestException('La fecha de devolución no puede ser anterior a la fecha de préstamo.');
                }
            }

            const data: Prisma.PrestamoUpdateInput = {
                estadoPrestamo: nextEstado,
                fechaDevolucion: updatePrestamoDto.fechaDevolucion
                    ? new Date(updatePrestamoDto.fechaDevolucion)
                    : (nextEstado === EstadoPrestamo.DEVUELTO ? new Date() : undefined),
            };

            // Status Transitions
            if (nextEstado && nextEstado !== prevEstado) {
                const ejemplar = await tx.ejemplar.findUnique({
                    where: { ejemplarId: prestamo.ejemplarId },
                });

                if (!ejemplar) throw new NotFoundException('Ejemplar no encontrado');

                // FROM ACTIVO
                if (prevEstado === EstadoPrestamo.ACTIVO) {
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
                            if (est.sanciones >= 3) {
                                await tx.estudiante.update({
                                    where: { estudianteId: prestamo.estudianteId },
                                    data: { activo: false },
                                });
                            }
                        }
                    } else if (nextEstado === EstadoPrestamo.PERDIDO) {
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
                }
                // TO ACTIVO (Undo)
                else if (nextEstado === EstadoPrestamo.ACTIVO) {
                    if (ejemplar.estado !== EstadoEjemplar.DISPONIBLE && ejemplar.estado !== EstadoEjemplar.PERDIDO) {
                        // Warning: If it was DISPONIBLE we can grab it. 
                        // If it was already lent to someone else (unlikely given ID check, but physically possible if ID reused), we conflict.
                        // But here we just assume if we are reactivating THIS loan, we want THIS exemplar.
                        // Strict check:
                        if (ejemplar.estado === EstadoEjemplar.PRESTADO) {
                            throw new ConflictException('El ejemplar ya está prestado (posiblemente a otro usuario).');
                        }
                    }

                    await tx.ejemplar.update({
                        where: { ejemplarId: ejemplar.ejemplarId },
                        data: { estado: EstadoEjemplar.PRESTADO },
                    });
                }
            }

            return tx.prestamo.update({
                where: { prestamoId: id },
                data,
            });
        });
    }

    remove(id: number) {
        throw new BadRequestException('No se permite eliminar préstamos.');
    }
}


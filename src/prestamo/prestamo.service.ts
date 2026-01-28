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
                where: { idEstudiante: createPrestamoDto.idEstudiante },
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
                    idEstudiante: createPrestamoDto.idEstudiante,
                    estadoPrestamo: EstadoPrestamo.ACTIVO,
                },
            });

            const activeLoansCount = activeLoans.length;

            if (activeLoansCount >= MAX_LOANS) {
                throw new ConflictException(
                    `El estudiante ya tiene el máximo de ${MAX_LOANS} libros prestados.`,
                );
            }

            // 2.1 Check for overdue loans (Sanción)
            const nowForOverdue = new Date();
            const overdueLoansCount = activeLoans.filter(l => l.fechaDevolucion && l.fechaDevolucion < nowForOverdue).length;

            if (overdueLoansCount >= 3) {
                // Deactivate student as penalty
                await tx.estudiante.update({
                    where: { idEstudiante: createPrestamoDto.idEstudiante },
                    data: { activo: false },
                });
                throw new ConflictException(
                    `El estudiante ha sido desactivado por tener ${overdueLoansCount} libros vencidos sin devolver.`,
                );
            }

            // 3. Check if Exemplar is available with ROW LOCK (FOR UPDATE)
            // We use raw query to enforce database-level lock on the row
            const ejemplares = await tx.$queryRaw<any[]>`
                SELECT * FROM "Ejemplar" 
                WHERE "idEjemplar" = ${createPrestamoDto.idEjemplar} 
                FOR UPDATE
            `;

            if (ejemplares.length === 0) throw new NotFoundException('Ejemplar no encontrado');
            const ejemplar = ejemplares[0];

            // Manual check because raw result fields might be lowercase depending on driver, 
            // but usually matching DB column names. Prisma raw returns exact column names.
            if (ejemplar.cantidadDisponible <= 0) {
                throw new ConflictException('No hay ejemplares disponibles para préstamo.');
            }

            // 4. Create the loan and update stock
            const now = new Date();
            const fechaLimite = new Date(createPrestamoDto.fechaLimite);

            if (isNaN(fechaLimite.getTime())) {
                throw new BadRequestException('Fecha límite inválida.');
            }

            if (fechaLimite < now) {
                throw new BadRequestException(
                    'La fecha límite de devolución no puede ser anterior a la fecha actual.',
                );
            }

            // (Optional) validate explicit return date if provided, though usually it's null on create
            const fechaDevolucion = createPrestamoDto.fechaDevolucion
                ? new Date(createPrestamoDto.fechaDevolucion)
                : null;

            if (fechaDevolucion && fechaDevolucion < now) {
                throw new BadRequestException(
                    'La fecha de devolución programada no puede ser en el pasado.',
                );
            }

            // Update Stock: Decrement cantidadDisponible
            const newDisponible = ejemplar.cantidadDisponible - 1;
            await tx.ejemplar.update({
                where: { idEjemplar: createPrestamoDto.idEjemplar },
                data: {
                    cantidadDisponible: newDisponible,
                    estado: newDisponible === 0 ? EstadoEjemplar.PRESTADO : EstadoEjemplar.DISPONIBLE,
                },
            });

            return tx.prestamo.create({
                data: {
                    estadoPrestamo: EstadoPrestamo.ACTIVO,
                    fechaPrestamo: now,
                    fechaLimite: fechaLimite,
                    fechaDevolucion: fechaDevolucion,
                    estudiante: { connect: { idEstudiante: createPrestamoDto.idEstudiante } },
                    bibliotecario: { connect: { idBibliotecario: createPrestamoDto.idBibliotecario } },
                    ejemplar: { connect: { idEjemplar: createPrestamoDto.idEjemplar } },
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
            where: { idPrestamo: id },
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
                where: { idPrestamo: id },
            });

            if (!prestamo) {
                throw new NotFoundException(`Prestamo con ID ${id} no encontrado`);
            }

            const prevEstado = prestamo.estadoPrestamo;
            const nextEstado = updatePrestamoDto.estadoPrestamo;

            // Logic for dates validation
            if (updatePrestamoDto.fechaDevolucion) {
                const newFechaDev = new Date(updatePrestamoDto.fechaDevolucion);
                if (newFechaDev < prestamo.fechaPrestamo) {
                    throw new BadRequestException(
                        'La fecha de devolución no puede ser anterior a la fecha de préstamo.',
                    );
                }
            }

            // Prepare update data
            const data: Prisma.PrestamoUpdateInput = {
                estadoPrestamo: nextEstado,
                fechaDevolucion: updatePrestamoDto.fechaDevolucion
                    ? new Date(updatePrestamoDto.fechaDevolucion)
                    : (nextEstado === EstadoPrestamo.DEVUELTO ? new Date() : undefined),
            };

            // Handle Side Effects on Stock and Student if status changes
            if (nextEstado && nextEstado !== prevEstado) {
                const ejemplar = await tx.ejemplar.findUnique({
                    where: { idEjemplar: prestamo.idEjemplar },
                });

                if (!ejemplar) throw new NotFoundException('Ejemplar no encontrado');

                // Transitions FROM ACTIVO
                if (prevEstado === EstadoPrestamo.ACTIVO) {
                    if (nextEstado === EstadoPrestamo.DEVUELTO) {
                        // RETURNED: Increment stock
                        const newDisponible = ejemplar.cantidadDisponible + 1;
                        await tx.ejemplar.update({
                            where: { idEjemplar: ejemplar.idEjemplar },
                            data: {
                                cantidadDisponible: newDisponible,
                                estado: EstadoEjemplar.DISPONIBLE,
                            },
                        });

                        // Check for Late Return (Sanción persistente)
                        const fechaRetorno = (data.fechaDevolucion as Date) || new Date();

                        if (prestamo.fechaLimite && fechaRetorno > prestamo.fechaLimite) {
                            // Increment persistent sanctions
                            const estudianteUpdated = await tx.estudiante.update({
                                where: { idEstudiante: prestamo.idEstudiante },
                                data: { sanciones: { increment: 1 } },
                            });

                            // Apply penalty threshold
                            if (estudianteUpdated.sanciones >= 3) {
                                await tx.estudiante.update({
                                    where: { idEstudiante: prestamo.idEstudiante },
                                    data: { activo: false },
                                });
                            }
                        }
                    } else if (nextEstado === EstadoPrestamo.PERDIDO) {
                        // LOST: Decrement total quantity, de-activate student
                        await tx.ejemplar.update({
                            where: { idEjemplar: ejemplar.idEjemplar },
                            data: {
                                cantidadTotal: { decrement: 1 },
                                // If disponible was 0, it might still be 0, but total is less.
                                // If it was already lent, disponible stays same.
                            },
                        });

                        await tx.estudiante.update({
                            where: { idEstudiante: prestamo.idEstudiante },
                            data: { activo: false },
                        });
                    }
                }

                // Transitions TO ACTIVO (e.g. correcting a mistake)
                else if (nextEstado === EstadoPrestamo.ACTIVO) {
                    if (ejemplar.cantidadDisponible <= 0) {
                        throw new ConflictException('No hay ejemplares disponibles para reactivar este préstamo.');
                    }
                    const newDisponible = ejemplar.cantidadDisponible - 1;
                    await tx.ejemplar.update({
                        where: { idEjemplar: ejemplar.idEjemplar },
                        data: {
                            cantidadDisponible: newDisponible,
                            estado: newDisponible === 0 ? EstadoEjemplar.NO_DISPONIBLE : EstadoEjemplar.DISPONIBLE,
                        },
                    });

                    // If it was lost, we might need to restore total count? 
                    // Usually mistakes are better handled by deleting and re-creating, 
                    // but let's handle the total count restore if it was PERDIDO
                    if (prevEstado === EstadoPrestamo.PERDIDO) {
                        await tx.ejemplar.update({
                            where: { idEjemplar: ejemplar.idEjemplar },
                            data: { cantidadTotal: { increment: 1 } },
                        });
                        // Note: Not auto-activating student because we don't know why they were deactivated.
                    }
                }
            }

            return tx.prestamo.update({
                where: { idPrestamo: id },
                data,
            });
        });
    }

    remove(id: number) {
        throw new BadRequestException('No se permite eliminar préstamos. Use los cambios de estado (DEVUELTO/PERDIDO) para mantener la trazabilidad.');
    }
}


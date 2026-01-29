import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, EstadoEjemplar, EstadoPrestamo } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEjemplarDto } from './dto/create-ejemplar.dto';
import { UpdateEjemplarDto } from './dto/update-ejemplar.dto';

@Injectable()
export class EjemplarService {
    constructor(private prisma: PrismaService) { }

    async create(createEjemplarDto: CreateEjemplarDto) {
        const { codigoLibro, cantidadTotal, cantidadDisponible, ...rest } = createEjemplarDto;

        const incrementAmount = cantidadTotal ?? 1;

        // Try to find an existing ejemplar for this libro
        const existing = await this.prisma.ejemplar.findUnique({
            where: { codigoLibro },
        });

        if (existing) {
            // Increment logic
            return this.prisma.ejemplar.update({
                where: { ejemplarId: existing.ejemplarId },
                data: {
                    cantidadTotal: { increment: incrementAmount },
                    cantidadDisponible: { increment: incrementAmount },
                    estado: EstadoEjemplar.DISPONIBLE, // Ensure it's available since we just added stock
                },
            });
        }

        // New record logic
        const total = incrementAmount;
        const disponible = cantidadDisponible ?? total;

        if (disponible > total) {
            throw new BadRequestException('La cantidad disponible no puede ser mayor a la cantidad total.');
        }

        return this.prisma.ejemplar.create({
            data: {
                ...rest,
                cantidadTotal: total,
                cantidadDisponible: disponible,
                estado: disponible === 0 ? EstadoEjemplar.NO_DISPONIBLE : (rest.estado as EstadoEjemplar || EstadoEjemplar.DISPONIBLE),
                libro: { connect: { codigoLibro: codigoLibro } },
            } as Prisma.EjemplarCreateInput,
        });
    }

    findAll() {
        return this.prisma.ejemplar.findMany({
            include: {
                libro: {
                    include: {
                        categoria: true,
                        editorial: true,
                        autores: {
                            include: {
                                autor: true,
                            },
                        },
                    },
                },
            },
        });
    }

    findOne(id: number) {
        return this.prisma.ejemplar.findUnique({
            where: { ejemplarId: id },
            include: {
                libro: {
                    include: {
                        categoria: true,
                        editorial: true,
                        autores: {
                            include: {
                                autor: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async update(id: number, updateEjemplarDto: UpdateEjemplarDto) {
        return this.prisma.$transaction(async (tx) => {
            const existing = await tx.ejemplar.findUnique({
                where: { ejemplarId: id },
            });

            if (!existing) {
                throw new NotFoundException(`Ejemplar con ID ${id} no encontrado`);
            }

            // 1. Count active loans
            const activeLoans = await tx.prestamo.count({
                where: {
                    ejemplarId: id,
                    estadoPrestamo: EstadoPrestamo.ACTIVO,
                },
            });

            const newCantidadTotal = updateEjemplarDto.cantidadTotal !== undefined
                ? updateEjemplarDto.cantidadTotal
                : existing.cantidadTotal;

            // Validation 1: cantidadTotal cannot be less than active loans
            if (newCantidadTotal < activeLoans) {
                throw new ConflictException(
                    `No se puede reducir la cantidad total a ${newCantidadTotal} porque hay ${activeLoans} préstamos activos.`,
                );
            }

            // Validation 2: cantidadDisponible must be consistent
            let newCantidadDisponible = updateEjemplarDto.cantidadDisponible !== undefined
                ? updateEjemplarDto.cantidadDisponible
                : existing.cantidadDisponible;

            // If we reduced total, we might need to cap disponible
            if (newCantidadDisponible > newCantidadTotal - activeLoans) {
                // If the user explicitly tried to set it too high, we throw error
                if (updateEjemplarDto.cantidadDisponible !== undefined) {
                    throw new BadRequestException(
                        `La cantidad disponible no puede ser mayor a ${newCantidadTotal - activeLoans} (Total: ${newCantidadTotal} - Préstamos Activos: ${activeLoans}).`
                    );
                }
                // Otherwise, auto-adjust
                newCantidadDisponible = newCantidadTotal - activeLoans;
            }

            // 3. Prepare update data
            const { codigoLibro, ...restDto } = updateEjemplarDto;
            const data: Prisma.EjemplarUpdateInput = {
                ...restDto,
                cantidadTotal: newCantidadTotal,
                cantidadDisponible: newCantidadDisponible,
                estado: newCantidadDisponible === 0
                    ? (updateEjemplarDto.estado as EstadoEjemplar || EstadoEjemplar.NO_DISPONIBLE)
                    : (updateEjemplarDto.estado as EstadoEjemplar || EstadoEjemplar.DISPONIBLE),
            };

            if (codigoLibro) {
                data.libro = { connect: { codigoLibro } };
            }

            return tx.ejemplar.update({
                where: { ejemplarId: id },
                data,
            });
        });
    }

    async remove(id: number) {
        return this.prisma.$transaction(async (tx) => {
            const existing = await tx.ejemplar.findUnique({
                where: { ejemplarId: id },
            });

            if (!existing) {
                throw new NotFoundException(`Ejemplar con ID ${id} no encontrado`);
            }

            if (existing.cantidadTotal > 1) {
                // If there are multiple units, we decrement.
                // But first, we must check if there's at least one unit available (not lent).
                if (existing.cantidadDisponible <= 0) {
                    throw new ConflictException(
                        `No se puede eliminar un ejemplar porque todos los ${existing.cantidadTotal} están actualmente prestados o no disponibles.`,
                    );
                }

                const newCantidadDisponible = existing.cantidadDisponible - 1;

                return tx.ejemplar.update({
                    where: { ejemplarId: id },
                    data: {
                        cantidadTotal: { decrement: 1 },
                        cantidadDisponible: newCantidadDisponible,
                        estado: newCantidadDisponible === 0 ? EstadoEjemplar.NO_DISPONIBLE : existing.estado,
                    },
                });
            }

            // If it's the last unit, we check if it's available before deleting the record.
            if (existing.cantidadDisponible === 0) {
                throw new ConflictException(
                    `No se puede eliminar el registro del ejemplar porque la última unidad está prestada o no disponible.`,
                );
            }

            return tx.ejemplar.delete({
                where: { ejemplarId: id },
            });
        });
    }
}


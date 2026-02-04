import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, EstadoEjemplar, EstadoPrestamo } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEjemplarDto } from './dto/create-ejemplar.dto';
import { UpdateEjemplarDto } from './dto/update-ejemplar.dto';
import { UpdateQuantityDto } from './dto/update-quantity.dto';

@Injectable()
export class EjemplarService {
    constructor(private prisma: PrismaService) { }

    async create(createEjemplarDto: CreateEjemplarDto) {
        // Verificar que el libro existe
        const libroExists = await this.prisma.libro.findUnique({
            where: { codigoLibro: createEjemplarDto.codigoLibro },
        });

        if (!libroExists) {
            throw new NotFoundException(
                `No existe un libro con codigoLibro ${createEjemplarDto.codigoLibro}`
            );
        }

        try {
            // En el nuevo modelo, creamos una unidad física indivisible
            return await this.prisma.ejemplar.create({
                data: {
                    codigoLibro: createEjemplarDto.codigoLibro,
                    ubicacion: createEjemplarDto.ubicacion,
                    codigoBarras: createEjemplarDto.codigoBarras,
                    estado: (createEjemplarDto.estado as EstadoEjemplar) || EstadoEjemplar.DISPONIBLE,
                },
                include: {
                    libro: {
                        include: {
                            categorias: true,
                            editoriales: true,
                            autores: {
                                include: {
                                    autor: true,
                                },
                            },
                        },
                    },
                },
            });
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ConflictException(
                    `Ya existe un ejemplar con este código de barras: ${createEjemplarDto.codigoBarras}`
                );
            }
            if (error.code === 'P2003') {
                throw new BadRequestException(
                    `Referencia inválida. Verifica que el libro con codigoLibro ${createEjemplarDto.codigoLibro} exista.`
                );
            }
            throw error;
        }
    }

    findAll() {
        return this.prisma.ejemplar.findMany({
            include: {
                libro: {
                    include: {
                        categorias: true,
                        editoriales: true,
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
                        categorias: true,
                        editoriales: true,
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
        // Verificar que el ejemplar existe
        const ejemplarExists = await this.prisma.ejemplar.findUnique({
            where: { ejemplarId: id },
        });

        if (!ejemplarExists) {
            throw new NotFoundException(
                `No existe un ejemplar con ejemplarId ${id}`
            );
        }

        // Si se está actualizando el codigoLibro, verificar que el nuevo libro existe
        if (updateEjemplarDto.codigoLibro && updateEjemplarDto.codigoLibro !== ejemplarExists.codigoLibro) {
            const libroExists = await this.prisma.libro.findUnique({
                where: { codigoLibro: updateEjemplarDto.codigoLibro },
            });

            if (!libroExists) {
                throw new NotFoundException(
                    `No existe un libro con codigoLibro ${updateEjemplarDto.codigoLibro}`
                );
            }
        }

        try {
            return await this.prisma.ejemplar.update({
                where: { ejemplarId: id },
                data: {
                    codigoLibro: updateEjemplarDto.codigoLibro,
                    ubicacion: updateEjemplarDto.ubicacion,
                    codigoBarras: updateEjemplarDto.codigoBarras,
                    estado: updateEjemplarDto.estado as EstadoEjemplar,
                },
                include: {
                    libro: {
                        include: {
                            categorias: true,
                            editoriales: true,
                            autores: {
                                include: {
                                    autor: true,
                                },
                            },
                        },
                    },
                },
            });
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ConflictException(
                    `Ya existe un ejemplar con este código de barras: ${updateEjemplarDto.codigoBarras}`
                );
            }
            if (error.code === 'P2003') {
                throw new BadRequestException(
                    `Referencia inválida. Verifica que el libro exista.`
                );
            }
            throw error;
        }
    }

    async remove(id: number) {
        // Keeping this method compatible with Unit Model by simply deleting the record
        // The original logic in conflict was Quantity based, so we replace it with simple delete for now
        // or check for active loans before deleting.

        return this.prisma.$transaction(async (tx) => {
            const existing = await tx.ejemplar.findUnique({
                where: { ejemplarId: id },
            });

            if (!existing) {
                throw new NotFoundException(`Ejemplar con ID ${id} no encontrado`);
            }

            // Check if it's currently lent
            if (existing.estado === EstadoEjemplar.PRESTADO) {
                throw new ConflictException(`No se puede eliminar el ejemplar porque está prestado.`);
            }

            return tx.ejemplar.delete({
                where: { ejemplarId: id },
            });
        });
    }

    async updateQuantity(libroId: number, updateQuantityDto: UpdateQuantityDto) {
        const { cantidad: nuevaCantidad, ubicacion } = updateQuantityDto;

        const libroExists = await this.prisma.libro.findUnique({
            where: { codigoLibro: libroId },
        });

        if (!libroExists) {
            throw new NotFoundException(`No existe un libro con codigoLibro ${libroId}`);
        }

        // Obtener todos los ejemplares actuales
        const ejemplares = await this.prisma.ejemplar.findMany({
            where: { codigoLibro: libroId },
        });

        const cantidadActual = ejemplares.length;

        if (nuevaCantidad === cantidadActual) {
            return { message: 'La cantidad es la misma, no se realizaron cambios.', currentCount: cantidadActual };
        }

        if (nuevaCantidad > cantidadActual) {
            // INCREMENTO
            const cantidadAcrear = nuevaCantidad - cantidadActual;
            const now = Date.now();

            const createPromises = Array.from({ length: cantidadAcrear }).map((_, index) => {
                return this.prisma.ejemplar.create({
                    data: {
                        codigoLibro: libroId,
                        ubicacion: ubicacion || 'Biblioteca Central',
                        estado: EstadoEjemplar.DISPONIBLE,
                        codigoBarras: `LIB-${libroId}-${now}-${index}`, // Autogenerado Option B
                    }
                });
            });

            await this.prisma.$transaction([
                ...createPromises,
                this.prisma.historialStock.create({
                    data: {
                        libroId,
                        cantidadAnterior: cantidadActual,
                        cantidadNueva: nuevaCantidad,
                        tipoMovimiento: 'INCREMENTO',
                        usuario: 'Sistema' // TODO: Pass user context if available
                    }
                })
            ]);

        } else {
            // DECREMENTO
            const cantidadAEliminar = cantidadActual - nuevaCantidad;

            // Filtramos solo los disponibles
            const disponibles = ejemplares.filter(e => e.estado === EstadoEjemplar.DISPONIBLE);

            if (disponibles.length < cantidadAEliminar) {
                throw new BadRequestException(
                    `No se puede reducir la cantidad a ${nuevaCantidad}. Solo hay ${disponibles.length} ejemplares DISPONIBLES para eliminar, pero se requiere eliminar ${cantidadAEliminar}. Existen ejemplares PRESTADOS, PERDIDOS o en REPARACION.`
                );
            }

            // Tomamos los IDs a eliminar (los últimos creados o arbitrarios)
            const idsAEliminar = disponibles.slice(0, cantidadAEliminar).map(e => e.ejemplarId);

            await this.prisma.$transaction([
                this.prisma.ejemplar.deleteMany({
                    where: { ejemplarId: { in: idsAEliminar } }
                }),
                this.prisma.historialStock.create({
                    data: {
                        libroId,
                        cantidadAnterior: cantidadActual,
                        cantidadNueva: nuevaCantidad,
                        tipoMovimiento: 'DECREMENTO',
                        usuario: 'Sistema'
                    }
                })
            ]);
        }

        return { message: 'Stock actualizado correctamente', previousCount: cantidadActual, newCount: nuevaCantidad };
    }

    async getHistory(libroId: number) {
        return this.prisma.historialStock.findMany({
            where: { libroId },
            orderBy: { fecha: 'desc' }
        });
    }
}

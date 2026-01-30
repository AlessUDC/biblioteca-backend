import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, EstadoEjemplar, EstadoPrestamo } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEjemplarDto } from './dto/create-ejemplar.dto';
import { UpdateEjemplarDto } from './dto/update-ejemplar.dto';

@Injectable()
export class EjemplarService {
    constructor(private prisma: PrismaService) { }

    async create(createEjemplarDto: CreateEjemplarDto) {
        // En el nuevo modelo, creamos una unidad física indivisible
        return this.prisma.ejemplar.create({
            data: {
                codigoLibro: createEjemplarDto.codigoLibro,
                ubicacion: createEjemplarDto.ubicacion,
                codigoBarras: createEjemplarDto.codigoBarras,
                estado: (createEjemplarDto.estado as EstadoEjemplar) || EstadoEjemplar.DISPONIBLE,
            },
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
        // Validación básica: si se intenta cambiar a DISPONIBLE, asegurar que no esté prestado?
        // En realidad, el estado se maneja manualmente o por Préstamos.
        // Si hay un préstamo activo, no debería poder pasarse a DISPONIBLE manualmente sin cerrar el préstamo.
        // Pero por ahora mantenemos la lógica simple CRUD.

        return this.prisma.ejemplar.update({
            where: { ejemplarId: id },
            data: {
                codigoLibro: updateEjemplarDto.codigoLibro,
                ubicacion: updateEjemplarDto.ubicacion,
                codigoBarras: updateEjemplarDto.codigoBarras,
                estado: updateEjemplarDto.estado as EstadoEjemplar,
            },
        });
    }

    async remove(id: number) {
        // Verificar Préstamos Activos
        const activeLoans = await this.prisma.prestamo.count({
            where: {
                ejemplarId: id,
                estadoPrestamo: EstadoPrestamo.ACTIVO,
            },
        });

        if (activeLoans > 0) {
            throw new ConflictException(
                `No se puede eliminar el ejemplar porque tiene un préstamo activo.`,
            );
        }

        return this.prisma.ejemplar.delete({
            where: { ejemplarId: id },
        });
    }
}


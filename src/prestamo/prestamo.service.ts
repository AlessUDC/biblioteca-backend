import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrestamoDto } from './dto/create-prestamo.dto';
import { UpdatePrestamoDto } from './dto/update-prestamo.dto';

@Injectable()
export class PrestamoService {
    constructor(private prisma: PrismaService) { }

    create(createPrestamoDto: CreatePrestamoDto) {
        const data: any = {
            idEstudiante: createPrestamoDto.idEstudiante,
            idBibliotecario: createPrestamoDto.idBibliotecario,
            idEjemplar: createPrestamoDto.idEjemplar,
            estadoPrestamo: createPrestamoDto.estadoPrestamo,
        };

        if (createPrestamoDto.fechaDevolucion) {
            data.fechaDevolucion = new Date(createPrestamoDto.fechaDevolucion);
        }

        return this.prisma.prestamo.create({
            data,
        });
    }

    findAll() {
        return this.prisma.prestamo.findMany({
            include: {
                estudiante: {
                    include: {
                        escuela: {
                            include: {
                                facultad: true,
                            },
                        },
                    },
                },
                bibliotecario: true,
                ejemplar: {
                    include: {
                        libro: {
                            include: {
                                area: true,
                                editorial: true,
                                autores: {
                                    include: {
                                        autor: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    }

    findOne(id: number) {
        return this.prisma.prestamo.findUnique({
            where: { idPrestamo: id },
            include: {
                estudiante: {
                    include: {
                        escuela: {
                            include: {
                                facultad: true,
                            },
                        },
                    },
                },
                bibliotecario: true,
                ejemplar: {
                    include: {
                        libro: {
                            include: {
                                area: true,
                                editorial: true,
                                autores: {
                                    include: {
                                        autor: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    }

    update(id: number, updatePrestamoDto: UpdatePrestamoDto) {
        const data: any = { ...updatePrestamoDto };

        if (updatePrestamoDto.fechaDevolucion) {
            data.fechaDevolucion = new Date(updatePrestamoDto.fechaDevolucion);
        }

        return this.prisma.prestamo.update({
            where: { idPrestamo: id },
            data,
        });
    }

    remove(id: number) {
        return this.prisma.prestamo.delete({
            where: { idPrestamo: id },
        });
    }
}

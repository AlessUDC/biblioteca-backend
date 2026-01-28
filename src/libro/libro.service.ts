import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLibroDto } from './dto/create-libro.dto';
import { UpdateLibroDto } from './dto/update-libro.dto';

@Injectable()
export class LibroService {
    constructor(private prisma: PrismaService) { }

    create(createLibroDto: CreateLibroDto) {
        const { autoresIds, ...libroData } = createLibroDto;
        return this.prisma.libro.create({
            data: {
                ...libroData,
                autores: {
                    create: autoresIds.map((id) => ({
                        autor: { connect: { idAutor: id } },
                    })),
                },
            },
            include: {
                autores: {
                    include: {
                        autor: true,
                    },
                },
            }
        });
    }

    findAll() {
        return this.prisma.libro.findMany({
            include: {
                area: true,
                editorial: true,
                autores: {
                    include: {
                        autor: true,
                    },
                },
            },
        });
    }

    findOne(id: number) {
        return this.prisma.libro.findUnique({
            where: { codigoLibro: id },
            include: {
                area: true,
                editorial: true,
                autores: {
                    include: {
                        autor: true,
                    },
                },
            },
        });
    }

    async update(id: number, updateLibroDto: UpdateLibroDto) {
        const { autoresIds, ...libroData } = updateLibroDto;

        // If autoresIds is provided, we clear existing associations and create new ones
        if (autoresIds) {
            await this.prisma.libroAutor.deleteMany({
                where: { idLibro: id },
            });

            return this.prisma.libro.update({
                where: { codigoLibro: id },
                data: {
                    ...libroData,
                    autores: {
                        create: autoresIds.map((idAutor) => ({
                            autor: { connect: { idAutor } },
                        })),
                    },
                },
                include: {
                    area: true,
                    editorial: true,
                    autores: {
                        include: {
                            autor: true,
                        },
                    },
                },
            });
        }

        return this.prisma.libro.update({
            where: { codigoLibro: id },
            data: libroData as any,
            include: {
                area: true,
                editorial: true,
                autores: {
                    include: {
                        autor: true,
                    },
                },
            },
        });
    }

    async remove(id: number) {
        await this.prisma.libroAutor.deleteMany({
            where: { idLibro: id },
        });
        return this.prisma.libro.delete({
            where: { codigoLibro: id },
        });
    }
}

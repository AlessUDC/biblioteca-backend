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

    update(id: number, updateLibroDto: UpdateLibroDto) {
        return this.prisma.libro.update({
            where: { codigoLibro: id },
            data: updateLibroDto,
        });
    }

    remove(id: number) {
        return this.prisma.libro.delete({
            where: { codigoLibro: id },
        });
    }
}

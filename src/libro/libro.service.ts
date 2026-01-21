import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLibroDto } from './dto/create-libro.dto';
import { UpdateLibroDto } from './dto/update-libro.dto';

@Injectable()
export class LibroService {
    constructor(private prisma: PrismaService) { }

    create(createLibroDto: CreateLibroDto) {
        return this.prisma.libro.create({
            data: createLibroDto,
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
                ejemplares: true,
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
                ejemplares: true,
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

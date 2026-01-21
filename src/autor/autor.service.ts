import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAutorDto } from './dto/create-autor.dto';
import { UpdateAutorDto } from './dto/update-autor.dto';

@Injectable()
export class AutorService {
    constructor(private prisma: PrismaService) { }

    create(createAutorDto: CreateAutorDto) {
        return this.prisma.autor.create({
            data: createAutorDto,
        });
    }

    findAll() {
        return this.prisma.autor.findMany({
            include: {
                libros: {
                    include: {
                        libro: true,
                    },
                },
            },
        });
    }

    findOne(id: number) {
        return this.prisma.autor.findUnique({
            where: { idAutor: id },
            include: {
                libros: {
                    include: {
                        libro: true,
                    },
                },
            },
        });
    }

    update(id: number, updateAutorDto: UpdateAutorDto) {
        return this.prisma.autor.update({
            where: { idAutor: id },
            data: updateAutorDto,
        });
    }

    remove(id: number) {
        return this.prisma.autor.delete({
            where: { idAutor: id },
        });
    }
}

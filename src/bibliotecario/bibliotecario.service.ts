import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBibliotecarioDto } from './dto/create-bibliotecario.dto';
import { UpdateBibliotecarioDto } from './dto/update-bibliotecario.dto';

@Injectable()
export class BibliotecarioService {
    constructor(private prisma: PrismaService) { }

    create(createBibliotecarioDto: CreateBibliotecarioDto) {
        return this.prisma.bibliotecario.create({
            data: createBibliotecarioDto,
        });
    }

    findAll() {
        return this.prisma.bibliotecario.findMany();
    }

    findOne(id: number) {
        return this.prisma.bibliotecario.findUnique({
            where: { bibliotecarioId: id },
        });
    }

    update(id: number, updateBibliotecarioDto: UpdateBibliotecarioDto) {
        return this.prisma.bibliotecario.update({
            where: { bibliotecarioId: id },
            data: updateBibliotecarioDto,
        });
    }

    remove(id: number) {
        return this.prisma.bibliotecario.delete({
            where: { bibliotecarioId: id },
        });
    }
}

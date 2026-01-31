import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAutorDto } from './dto/create-autor.dto';
import { UpdateAutorDto } from './dto/update-autor.dto';

@Injectable()
export class AutorService {
    constructor(private prisma: PrismaService) { }

    async create(createAutorDto: CreateAutorDto) {
        try {
            return await this.prisma.autor.create({
                data: createAutorDto,
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    findAll() {
        return this.prisma.autor.findMany({
            orderBy: { apellidoPaterno: 'asc' }
        });
    }

    async findOne(id: number) {
        const autor = await this.prisma.autor.findUnique({
            where: { autorId: id },
        });
        if (!autor) {
            throw new NotFoundException(`Autor con ID ${id} no encontrado`);
        }
        return autor;
    }

    async update(id: number, updateAutorDto: UpdateAutorDto) {
        await this.findOne(id); // Verificar existencia
        try {
            return await this.prisma.autor.update({
                where: { autorId: id },
                data: updateAutorDto,
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    async remove(id: number) {
        await this.findOne(id); // Verificar existencia
        try {
            return await this.prisma.autor.delete({
                where: { autorId: id },
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    private handlePrismaError(error: any) {
        if (error instanceof NotFoundException) throw error;
        if (error.code === 'P2002') {
            throw new ConflictException(`Ya existe un autor con ese ORCID o campo duplicado.`);
        }
        if (error.code === 'P2003') {
            throw new BadRequestException(`No se puede eliminar el autor porque tiene libros asociados.`);
        }
        if (error.code === 'P2025') {
            throw new NotFoundException(`No se encontró el registro solicitado.`);
        }
        throw error;
    }
}

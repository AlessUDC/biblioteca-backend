import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEditorialDto } from './dto/create-editorial.dto';
import { UpdateEditorialDto } from './dto/update-editorial.dto';

@Injectable()
export class EditorialService {
    constructor(private prisma: PrismaService) { }

    async create(createEditorialDto: CreateEditorialDto) {
        try {
            return await this.prisma.editorial.create({
                data: createEditorialDto,
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    findAll() {
        return this.prisma.editorial.findMany({
            orderBy: { nombre: 'asc' }
        });
    }

    async findOne(id: number) {
        const editorial = await this.prisma.editorial.findUnique({
            where: { editorialId: id },
        });
        if (!editorial) {
            throw new NotFoundException(`Editorial con ID ${id} no encontrada`);
        }
        return editorial;
    }

    async update(id: number, updateEditorialDto: UpdateEditorialDto) {
        await this.findOne(id);
        try {
            return await this.prisma.editorial.update({
                where: { editorialId: id },
                data: updateEditorialDto,
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    async remove(id: number) {
        await this.findOne(id);
        try {
            return await this.prisma.editorial.delete({
                where: { editorialId: id },
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    private handlePrismaError(error: any) {
        if (error instanceof NotFoundException) throw error;
        if (error.code === 'P2002') {
            throw new ConflictException(`Ya existe una editorial con este nombre.`);
        }
        if (error.code === 'P2003') {
            throw new BadRequestException(`No se puede eliminar la editorial porque tiene libros asociados.`);
        }
        if (error.code === 'P2025') {
            throw new NotFoundException(`No se encontró el registro solicitado.`);
        }
        throw error;
    }
}

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriaService {
    constructor(private prisma: PrismaService) { }

    async create(createCategoriaDto: CreateCategoriaDto) {
        try {
            return await this.prisma.categoria.create({
                data: {
                    nombre: createCategoriaDto.nombre,
                },
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    findAll() {
        return this.prisma.categoria.findMany({
            orderBy: { nombre: 'asc' }
        });
    }

    async findOne(id: number) {
        const categoria = await this.prisma.categoria.findUnique({
            where: { categoriaId: id },
        });
        if (!categoria) {
            throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
        }
        return categoria;
    }

    async update(id: number, updateCategoriaDto: UpdateCategoriaDto) {
        await this.findOne(id);
        try {
            return await this.prisma.categoria.update({
                where: { categoriaId: id },
                data: updateCategoriaDto,
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    async remove(id: number) {
        const categoria = await this.prisma.categoria.findUnique({
            where: { categoriaId: id },
            include: {
                _count: {
                    select: { libros: true }
                }
            }
        });

        if (!categoria) {
            throw new NotFoundException(`La categoría con ID ${id} no existe.`);
        }

        if (categoria._count.libros > 0) {
            throw new ConflictException(
                `No se puede eliminar la categoría "${categoria.nombre}" porque tiene ${categoria._count.libros} libros asociados.`
            );
        }

        try {
            return await this.prisma.categoria.delete({
                where: { categoriaId: id },
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    private handlePrismaError(error: any) {
        if (error instanceof NotFoundException || error instanceof ConflictException) throw error;
        if (error.code === 'P2002') {
            throw new ConflictException(`Ya existe una categoría con este nombre.`);
        }
        if (error.code === 'P2003') {
            throw new BadRequestException(`No se puede eliminar la categoría porque tiene libros asociados.`);
        }
        if (error.code === 'P2025') {
            throw new NotFoundException(`No se encontró el registro solicitado.`);
        }
        throw error;
    }
}

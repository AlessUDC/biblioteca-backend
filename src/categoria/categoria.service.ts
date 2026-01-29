import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriaService {
    constructor(private prisma: PrismaService) { }

    create(createCategoriaDto: CreateCategoriaDto) {
        return this.prisma.categoria.create({
            data: {
                nombre: createCategoriaDto.nombre,
            },
        });
    }

    findAll() {
        return this.prisma.categoria.findMany();
    }

    async findOne(id: number) {
        const categoria = await this.prisma.categoria.findUnique({
            where: { categoriaId: id },
        });
        if (!categoria) {
            throw new NotFoundException(`Categoria with ID ${id} not found`);
        }
        return categoria;
    }

    async update(id: number, updateCategoriaDto: UpdateCategoriaDto) {
        await this.findOne(id);
        return this.prisma.categoria.update({
            where: { categoriaId: id },
            data: updateCategoriaDto,
        });
    }

    async remove(id: number) {
        // 1. Check if the Categoria exists
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

        // 2. Check if it has associated books
        if (categoria._count.libros > 0) {
            throw new ConflictException(
                `No se puede eliminar la categoría "${categoria.nombre}" porque tiene ${categoria._count.libros} libros asociados.`
            );
        }

        // 3. Delete if safe
        return this.prisma.categoria.delete({
            where: { categoriaId: id },
        });
    }
}

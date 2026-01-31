import { Injectable, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLibroDto } from './dto/create-libro.dto';
import { UpdateLibroDto } from './dto/update-libro.dto';

@Injectable()
export class LibroService {
    constructor(private prisma: PrismaService) { }

    async create(createLibroDto: CreateLibroDto) {
        const { autoresIds, categoriasIds, editorialesIds, ...libroData } = createLibroDto;

        try {
            return await this.prisma.libro.create({
                data: {
                    ...libroData,
                    autores: {
                        create: autoresIds.map((id) => ({
                            autor: { connect: { autorId: id } },
                        })),
                    },
                    categorias: {
                        connect: categoriasIds.map((id) => ({ categoriaId: id })),
                    },
                    editoriales: {
                        connect: editorialesIds.map((id) => ({ editorialId: id })),
                    },
                },
                include: {
                    autores: {
                        include: {
                            autor: true,
                        },
                    },
                    categorias: true,
                    editoriales: true,
                }
            });
        } catch (error) {
            if (error.code === 'P2002') {
                throw new BadRequestException(`Ya existe un libro con este código.`);
            }
            if (error.code === 'P2003') {
                throw new BadRequestException(`Referencia inválida. Verifica que las categorías, editoriales y autores existan.`);
            }
            if (error.code === 'P2025') {
                throw new NotFoundException(`No se encontró el registro relacionado.`);
            }
            throw error;
        }
    }

    findAll() {
        return this.prisma.libro.findMany({
            include: {
                categorias: true,
                editoriales: true,
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
                categorias: true,
                editoriales: true,
                autores: {
                    include: {
                        autor: true,
                    },
                },
            },
        });
    }

    async update(id: number, updateLibroDto: UpdateLibroDto) {
        const { autoresIds, categoriasIds, editorialesIds, ...libroData } = updateLibroDto;

        const updateData: any = { ...libroData };

        if (autoresIds) {
            await this.prisma.libroAutor.deleteMany({
                where: { libroId: id },
            });
            updateData.autores = {
                create: autoresIds.map((autorId) => ({
                    autor: { connect: { autorId } },
                })),
            };
        }

        if (categoriasIds) {
            updateData.categorias = {
                set: categoriasIds.map((id) => ({ categoriaId: id })),
            };
        }

        if (editorialesIds) {
            updateData.editoriales = {
                set: editorialesIds.map((id) => ({ editorialId: id })),
            };
        }

        return this.prisma.libro.update({
            where: { codigoLibro: id },
            data: updateData,
            include: {
                categorias: true,
                editoriales: true,
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
            where: { libroId: id },
        });
        // We might also want to disconnect categories/editorials but cascade/implicit handles it usually or it's just a relation
        return this.prisma.libro.delete({
            where: { codigoLibro: id },
        });
    }
}

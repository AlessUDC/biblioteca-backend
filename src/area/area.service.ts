import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';

@Injectable()
export class AreaService {
    constructor(private prisma: PrismaService) { }

    create(createAreaDto: CreateAreaDto) {
        return this.prisma.area.create({
            data: createAreaDto,
        });
    }

    findAll() {
        return this.prisma.area.findMany();
    }

    async findOne(id: number) {
        const area = await this.prisma.area.findUnique({
            where: { idArea: id },
        });
        if (!area) {
            throw new NotFoundException(`Area with ID ${id} not found`);
        }
        return area;
    }

    async update(id: number, updateAreaDto: UpdateAreaDto) {
        await this.findOne(id);
        return this.prisma.area.update({
            where: { idArea: id },
            data: updateAreaDto,
        });
    }

    async remove(id: number) {
        // 1. Check if the Area exists
        const area = await this.prisma.area.findUnique({
            where: { idArea: id },
            include: {
                _count: {
                    select: { libros: true }
                }
            }
        });

        if (!area) {
            throw new NotFoundException(`El área con ID ${id} no existe.`);
        }

        // 2. Check if it has associated books
        if (area._count.libros > 0) {
            throw new ConflictException(
                `No se puede eliminar el área "${area.nombreArea}" porque tiene ${area._count.libros} libros asociados.`
            );
        }

        // 3. Delete if safe
        return this.prisma.area.delete({
            where: { idArea: id },
        });
    }
}

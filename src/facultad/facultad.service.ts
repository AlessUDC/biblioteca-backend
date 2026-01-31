import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFacultadDto } from './dto/create-facultad.dto';
import { UpdateFacultadDto } from './dto/update-facultad.dto';

@Injectable()
export class FacultadService {
    constructor(private prisma: PrismaService) { }

    async create(createFacultadDto: CreateFacultadDto) {
        try {
            return await this.prisma.facultad.create({
                data: createFacultadDto,
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    findAll() {
        return this.prisma.facultad.findMany({
            orderBy: { nombre: 'asc' }
        });
    }

    async findOne(id: number) {
        const facultad = await this.prisma.facultad.findUnique({
            where: { facultadId: id },
            include: { escuelas: true }
        });
        if (!facultad) {
            throw new NotFoundException(`Facultad con ID ${id} no encontrada`);
        }
        return facultad;
    }

    async update(id: number, updateFacultadDto: UpdateFacultadDto) {
        await this.findOne(id);
        try {
            return await this.prisma.facultad.update({
                where: { facultadId: id },
                data: updateFacultadDto,
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    async remove(id: number) {
        await this.findOne(id);
        try {
            return await this.prisma.facultad.delete({
                where: { facultadId: id },
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    private handlePrismaError(error: any) {
        if (error instanceof NotFoundException) throw error;
        if (error.code === 'P2002') {
            throw new ConflictException(`Ya existe una facultad con este nombre.`);
        }
        if (error.code === 'P2003') {
            throw new BadRequestException(`No se puede eliminar la facultad porque tiene escuelas o registros asociados.`);
        }
        if (error.code === 'P2025') {
            throw new NotFoundException(`No se encontró el registro solicitado.`);
        }
        throw error;
    }
}

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEscuelaDto } from './dto/create-escuela.dto';
import { UpdateEscuelaDto } from './dto/update-escuela.dto';

@Injectable()
export class EscuelaService {
    constructor(private prisma: PrismaService) { }

    async create(createEscuelaDto: CreateEscuelaDto) {
        // Verificar que la facultad existe
        const facultad = await this.prisma.facultad.findUnique({
            where: { facultadId: createEscuelaDto.facultadId },
        });
        if (!facultad) throw new NotFoundException(`Facultad con ID ${createEscuelaDto.facultadId} no encontrada`);

        try {
            return await this.prisma.escuela.create({
                data: createEscuelaDto,
                include: { facultad: true },
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    findAll() {
        return this.prisma.escuela.findMany({
            include: {
                facultad: true,
            },
            orderBy: { nombre: 'asc' }
        });
    }

    async findOne(id: number) {
        const escuela = await this.prisma.escuela.findUnique({
            where: { escuelaId: id },
            include: {
                facultad: true,
            },
        });
        if (!escuela) {
            throw new NotFoundException(`Escuela con ID ${id} no encontrada`);
        }
        return escuela;
    }

    async update(id: number, updateEscuelaDto: UpdateEscuelaDto) {
        const current = await this.findOne(id);

        if (updateEscuelaDto.facultadId && updateEscuelaDto.facultadId !== current.facultadId) {
            const facultad = await this.prisma.facultad.findUnique({
                where: { facultadId: updateEscuelaDto.facultadId },
            });
            if (!facultad) throw new NotFoundException(`Facultad con ID ${updateEscuelaDto.facultadId} no encontrada`);
        }

        try {
            return await this.prisma.escuela.update({
                where: { escuelaId: id },
                data: updateEscuelaDto,
                include: { facultad: true },
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    async remove(id: number) {
        await this.findOne(id);
        try {
            return await this.prisma.escuela.delete({
                where: { escuelaId: id },
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    private handlePrismaError(error: any) {
        if (error instanceof NotFoundException) throw error;
        if (error.code === 'P2002') {
            throw new ConflictException(`Ya existe una escuela con este nombre.`);
        }
        if (error.code === 'P2003') {
            throw new BadRequestException(`No se puede eliminar la escuela porque tiene estudiantes o registros asociados.`);
        }
        if (error.code === 'P2025') {
            throw new NotFoundException(`No se encontró el registro solicitado.`);
        }
        throw error;
    }
}

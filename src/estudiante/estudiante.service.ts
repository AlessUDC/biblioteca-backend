import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';

@Injectable()
export class EstudianteService {
    constructor(private prisma: PrismaService) { }

    create(createEstudianteDto: CreateEstudianteDto) {
        return this.prisma.estudiante.create({
            data: createEstudianteDto,
        });
    }

    findAll() {
        return this.prisma.estudiante.findMany({
            where: { activo: true },
            include: {
                escuela: true,
            },
        });
    }

    async findOne(id: number) {
        const estudiante = await this.prisma.estudiante.findFirst({
            where: { idEstudiante: id, activo: true },
            include: {
                escuela: true,
            },
        });
        if (!estudiante) {
            throw new NotFoundException(`Estudiante with ID ${id} not found`);
        }
        return estudiante;
    }

    update(id: number, updateEstudianteDto: UpdateEstudianteDto) {
        return this.prisma.estudiante.update({
            where: { idEstudiante: id },
            data: updateEstudianteDto,
        });
    }

    async remove(id: number) {
        const estudiante = await this.prisma.estudiante.findFirst({
            where: { idEstudiante: id, activo: true },
        });
        if (!estudiante) {
            throw new NotFoundException(`Estudiante with ID ${id} not found`);
        }
        return this.prisma.estudiante.update({
            where: { idEstudiante: id },
            data: { activo: false },
        });
    }
}

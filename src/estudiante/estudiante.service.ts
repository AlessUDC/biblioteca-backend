import { Injectable } from '@nestjs/common';
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
            include: {
                escuela: {
                    include: {
                        facultad: true,
                    },
                },
                prestamos: true,
            },
        });
    }

    findOne(id: number) {
        return this.prisma.estudiante.findUnique({
            where: { idEstudiante: id },
            include: {
                escuela: {
                    include: {
                        facultad: true,
                    },
                },
                prestamos: true,
            },
        });
    }

    update(id: number, updateEstudianteDto: UpdateEstudianteDto) {
        return this.prisma.estudiante.update({
            where: { idEstudiante: id },
            data: updateEstudianteDto,
        });
    }

    remove(id: number) {
        return this.prisma.estudiante.delete({
            where: { idEstudiante: id },
        });
    }
}

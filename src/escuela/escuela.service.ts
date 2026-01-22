import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEscuelaDto } from './dto/create-escuela.dto';
import { UpdateEscuelaDto } from './dto/update-escuela.dto';

@Injectable()
export class EscuelaService {
    constructor(private prisma: PrismaService) { }

    create(createEscuelaDto: CreateEscuelaDto) {
        return this.prisma.escuela.create({
            data: createEscuelaDto,
        });
    }

    findAll() {
        return this.prisma.escuela.findMany({
            include: {
                facultad: true,
            },
        });
    }

    findOne(id: number) {
        return this.prisma.escuela.findUnique({
            where: { idEscuela: id },
            include: {
                facultad: true,
            },
        });
    }

    update(id: number, updateEscuelaDto: UpdateEscuelaDto) {
        return this.prisma.escuela.update({
            where: { idEscuela: id },
            data: updateEscuelaDto,
        });
    }

    remove(id: number) {
        return this.prisma.escuela.delete({
            where: { idEscuela: id },
        });
    }
}

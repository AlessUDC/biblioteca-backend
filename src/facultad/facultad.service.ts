import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFacultadDto } from './dto/create-facultad.dto';
import { UpdateFacultadDto } from './dto/update-facultad.dto';

@Injectable()
export class FacultadService {
    constructor(private prisma: PrismaService) { }

    create(createFacultadDto: CreateFacultadDto) {
        return this.prisma.facultad.create({
            data: createFacultadDto,
        });
    }

    findAll() {
        return this.prisma.facultad.findMany({
            include: {
                escuelas: true,
            },
        });
    }

    findOne(id: number) {
        return this.prisma.facultad.findUnique({
            where: { idFacultad: id },
            include: {
                escuelas: true,
            },
        });
    }

    update(id: number, updateFacultadDto: UpdateFacultadDto) {
        return this.prisma.facultad.update({
            where: { idFacultad: id },
            data: updateFacultadDto,
        });
    }

    remove(id: number) {
        return this.prisma.facultad.delete({
            where: { idFacultad: id },
        });
    }
}

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
        return this.prisma.facultad.findMany();
    }

    findOne(id: number) {
        return this.prisma.facultad.findUnique({
            where: { facultadId: id },
        });
    }

    update(id: number, updateFacultadDto: UpdateFacultadDto) {
        return this.prisma.facultad.update({
            where: { facultadId: id },
            data: updateFacultadDto,
        });
    }

    remove(id: number) {
        return this.prisma.facultad.delete({
            where: { facultadId: id },
        });
    }
}

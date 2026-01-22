import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEjemplarDto } from './dto/create-ejemplar.dto';
import { UpdateEjemplarDto } from './dto/update-ejemplar.dto';

@Injectable()
export class EjemplarService {
    constructor(private prisma: PrismaService) { }

    create(createEjemplarDto: CreateEjemplarDto) {
        return this.prisma.ejemplar.create({
            data: createEjemplarDto,
        });
    }

    findAll() {
        return this.prisma.ejemplar.findMany({
            include: {
                libro: {
                    include: {
                        area: true,
                        editorial: true,
                        autores: {
                            include: {
                                autor: true,
                            },
                        },
                    },
                },
            },
        });
    }

    findOne(id: number) {
        return this.prisma.ejemplar.findUnique({
            where: { idEjemplar: id },
            include: {
                libro: {
                    include: {
                        area: true,
                        editorial: true,
                        autores: {
                            include: {
                                autor: true,
                            },
                        },
                    },
                },
            },
        });
    }

    update(id: number, updateEjemplarDto: UpdateEjemplarDto) {
        return this.prisma.ejemplar.update({
            where: { idEjemplar: id },
            data: updateEjemplarDto,
        });
    }

    remove(id: number) {
        return this.prisma.ejemplar.delete({
            where: { idEjemplar: id },
        });
    }
}

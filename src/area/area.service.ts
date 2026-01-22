import { Injectable } from '@nestjs/common';
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

    findOne(id: number) {
        return this.prisma.area.findUnique({
            where: { idArea: id },
        });
    }

    update(id: number, updateAreaDto: UpdateAreaDto) {
        return this.prisma.area.update({
            where: { idArea: id },
            data: updateAreaDto,
        });
    }

    remove(id: number) {
        return this.prisma.area.delete({
            where: { idArea: id },
        });
    }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEditorialDto } from './dto/create-editorial.dto';
import { UpdateEditorialDto } from './dto/update-editorial.dto';

@Injectable()
export class EditorialService {
    constructor(private prisma: PrismaService) { }

    create(createEditorialDto: CreateEditorialDto) {
        return this.prisma.editorial.create({
            data: createEditorialDto,
        });
    }

    findAll() {
        return this.prisma.editorial.findMany();
    }

    findOne(id: number) {
        return this.prisma.editorial.findUnique({
            where: { idEditorial: id },
        });
    }

    update(id: number, updateEditorialDto: UpdateEditorialDto) {
        return this.prisma.editorial.update({
            where: { idEditorial: id },
            data: updateEditorialDto,
        });
    }

    remove(id: number) {
        return this.prisma.editorial.delete({
            where: { idEditorial: id },
        });
    }
}

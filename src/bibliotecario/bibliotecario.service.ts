import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBibliotecarioDto } from './dto/create-bibliotecario.dto';
import { UpdateBibliotecarioDto } from './dto/update-bibliotecario.dto';

@Injectable()
export class BibliotecarioService {
    constructor(private prisma: PrismaService) { }

    async create(createBibliotecarioDto: CreateBibliotecarioDto) {
        try {
            return await this.prisma.bibliotecario.create({
                data: createBibliotecarioDto,
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    findAll() {
        return this.prisma.bibliotecario.findMany({
            orderBy: { apellidoPaterno: 'asc' }
        });
    }

    async findOne(id: number) {
        const bibliotecario = await this.prisma.bibliotecario.findUnique({
            where: { bibliotecarioId: id },
        });
        if (!bibliotecario) {
            throw new NotFoundException(`Bibliotecario con ID ${id} no encontrado`);
        }
        return bibliotecario;
    }

    async update(id: number, updateBibliotecarioDto: UpdateBibliotecarioDto) {
        await this.findOne(id);
        try {
            return await this.prisma.bibliotecario.update({
                where: { bibliotecarioId: id },
                data: updateBibliotecarioDto,
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    async remove(id: number) {
        await this.findOne(id);
        try {
            return await this.prisma.bibliotecario.delete({
                where: { bibliotecarioId: id },
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    private handlePrismaError(error: any) {
        if (error instanceof NotFoundException) throw error;
        if (error.code === 'P2002') {
            throw new ConflictException(`Ya existe un bibliotecario con este usuario o documento.`);
        }
        if (error.code === 'P2003') {
            throw new BadRequestException(`No se puede eliminar el bibliotecario porque tiene préstamos registrados.`);
        }
        if (error.code === 'P2025') {
            throw new NotFoundException(`No se encontró el registro solicitado.`);
        }
        throw error;
    }
}

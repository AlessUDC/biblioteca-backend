import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';

@Injectable()
export class EstudianteService {
    constructor(private prisma: PrismaService) { }

    async create(createEstudianteDto: CreateEstudianteDto) {
        // Verificar que la escuela existe
        const escuela = await this.prisma.escuela.findUnique({
            where: { escuelaId: createEstudianteDto.escuelaId },
        });
        if (!escuela) throw new NotFoundException(`Escuela con ID ${createEstudianteDto.escuelaId} no encontrada`);

        try {
            return await this.prisma.estudiante.create({
                data: createEstudianteDto,
                include: { escuela: true },
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    findAll(onlyActive: boolean = true) {
        return this.prisma.estudiante.findMany({
            where: onlyActive ? { activo: true } : {},
            include: {
                escuela: {
                    include: { facultad: true }
                },
            },
            orderBy: { nombre: 'asc' }
        });
    }

    async findByDocument(type: string, number: string) {
        return this.prisma.estudiante.findFirst({
            where: {
                tipoDocumento: type,
                numeroDocumento: number,
            },
            include: {
                escuela: {
                    include: { facultad: true }
                },
            },
        });
    }

    async findOne(id: number) {
        const estudiante = await this.prisma.estudiante.findUnique({
            where: { estudianteId: id },
            include: {
                escuela: {
                    include: { facultad: true }
                },
            },
        });
        if (!estudiante) {
            throw new NotFoundException(`Estudiante con ID ${id} no encontrado`);
        }
        return estudiante;
    }

    async update(id: number, updateEstudianteDto: UpdateEstudianteDto) {
        // Verificar existencia
        const current = await this.prisma.estudiante.findUnique({ where: { estudianteId: id } });
        if (!current) throw new NotFoundException(`Estudiante con ID ${id} no encontrado`);

        // Si cambia de escuela, verificar que la nueva exista
        if (updateEstudianteDto.escuelaId && updateEstudianteDto.escuelaId !== current.escuelaId) {
            const escuela = await this.prisma.escuela.findUnique({
                where: { escuelaId: updateEstudianteDto.escuelaId },
            });
            if (!escuela) throw new NotFoundException(`Escuela con ID ${updateEstudianteDto.escuelaId} no encontrada`);
        }

        try {
            return await this.prisma.estudiante.update({
                where: { estudianteId: id },
                data: updateEstudianteDto,
                include: { escuela: true },
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    async remove(id: number) {
        const estudiante = await this.prisma.estudiante.findUnique({
            where: { estudianteId: id },
        });
        if (!estudiante) {
            throw new NotFoundException(`Estudiante con ID ${id} no encontrado`);
        }

        // Soft delete
        return this.prisma.estudiante.update({
            where: { estudianteId: id },
            data: { activo: false },
        });
    }

    async sancionar(id: number) {
        const estudiante = await this.findOne(id);
        const nuevasSanciones = estudiante.sanciones + 1;
        return this.prisma.estudiante.update({
            where: { estudianteId: id },
            data: {
                sanciones: nuevasSanciones,
                activo: nuevasSanciones < 3,
            },
        });
    }

    async quitarSancion(id: number) {
        const estudiante = await this.findOne(id);
        const nuevasSanciones = Math.max(0, estudiante.sanciones - 1);
        return this.prisma.estudiante.update({
            where: { estudianteId: id },
            data: {
                sanciones: nuevasSanciones,
                activo: nuevasSanciones < 3,
            },
        });
    }

    private handlePrismaError(error: any) {
        if (error instanceof NotFoundException) throw error;

        if (error.code === 'P2002') {
            throw new ConflictException(`Ya existe un estudiante con ese número de documento.`);
        }
        if (error.code === 'P2003') {
            throw new BadRequestException(`Error de relación. Verifique que la escuela asignada exista.`);
        }
        if (error.code === 'P2025') {
            throw new NotFoundException(`No se encontró el registro para actualizar o eliminar.`);
        }
        throw error;
    }
}

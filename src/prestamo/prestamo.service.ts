import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrestamoDto } from './dto/create-prestamo.dto';
import { UpdatePrestamoDto } from './dto/update-prestamo.dto';

@Injectable()
export class PrestamoService {
    constructor(private prisma: PrismaService) { }

    async create(createPrestamoDto: CreatePrestamoDto) {
        // Check if Exemplar is available
        const activeLoan = await this.prisma.prestamo.findFirst({
            where: {
                idEjemplar: createPrestamoDto.idEjemplar,
                estadoPrestamo: 'ACTIVO',
            },
        });

        if (activeLoan) {
            throw new ConflictException('El ejemplar ya se encuentra prestado.');
        }

        return this.prisma.prestamo.create({
            data: {
                ...createPrestamoDto,
                estadoPrestamo: 'ACTIVO',
                fechaPrestamo: new Date(),
            },
        });
    }

    findAll() {
        return this.prisma.prestamo.findMany({
            include: {
                estudiante: true,
                bibliotecario: true,
                ejemplar: {
                    include: {
                        libro: true,
                    },
                },
            },
        });
    }

    findOne(id: number) {
        return this.prisma.prestamo.findUnique({
            where: { idPrestamo: id },
            include: {
                estudiante: true,
                bibliotecario: true,
                ejemplar: {
                    include: {
                        libro: true,
                    },
                },
            },
        });
    }

    update(id: number, updatePrestamoDto: UpdatePrestamoDto) {
        const data: any = { ...updatePrestamoDto };

        // Logic for return: specific state change handling could go here
        // For now, if client sends DEVUELTO, we assume it is valid update
        // We could automate date setting here if we wanted to enforce it

        return this.prisma.prestamo.update({
            where: { idPrestamo: id },
            data,
        });
    }

    remove(id: number) {
        return this.prisma.prestamo.delete({
            where: { idPrestamo: id },
        });
    }
}

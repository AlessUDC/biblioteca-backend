import { IsInt, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { EstadoPrestamo } from '@prisma/client';

export class CreatePrestamoDto {
    @IsInt()
    idEstudiante: number;

    @IsInt()
    idBibliotecario: number;

    @IsInt()
    idEjemplar: number;

    @IsEnum(EstadoPrestamo)
    estadoPrestamo: EstadoPrestamo;

    @IsOptional()
    @IsDateString()
    fechaDevolucion?: string;
}

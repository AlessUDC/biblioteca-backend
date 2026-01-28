import { IsDateString, IsOptional, IsEnum } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreatePrestamoDto } from './create-prestamo.dto';

export class UpdatePrestamoDto extends PartialType(CreatePrestamoDto) {
    @IsOptional()
    @IsDateString()
    fechaDevolucion?: string;

    @IsOptional()
    @IsEnum(['ACTIVO', 'DEVUELTO', 'PERDIDO'])
    estadoPrestamo?: 'ACTIVO' | 'DEVUELTO' | 'PERDIDO';
}

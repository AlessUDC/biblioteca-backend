import { IsInt, IsOptional, IsDateString } from 'class-validator';

export class CreatePrestamoDto {
    @IsInt()
    estudianteId: number;

    @IsInt()
    bibliotecarioId: number;

    @IsInt()
    ejemplarId: number;

    @IsOptional()
    @IsDateString()
    fechaDevolucion?: string;

    @IsDateString()
    fechaLimite: string;
}

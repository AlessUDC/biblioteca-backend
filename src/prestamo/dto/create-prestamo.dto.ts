import { IsInt, IsOptional, IsDateString } from 'class-validator';

export class CreatePrestamoDto {
    @IsInt()
    idEstudiante: number;

    @IsInt()
    idBibliotecario: number;

    @IsInt()
    idEjemplar: number;

    @IsOptional()
    @IsDateString()
    fechaDevolucion?: string;

    @IsDateString()
    fechaLimite: string;
}

import { IsInt } from 'class-validator';

export class CreatePrestamoDto {
    @IsInt()
    idEstudiante: number;

    @IsInt()
    idBibliotecario: number;

    @IsInt()
    idEjemplar: number;
}

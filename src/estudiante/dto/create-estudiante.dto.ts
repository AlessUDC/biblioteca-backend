import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateEstudianteDto {
    @IsString()
    @IsNotEmpty()
    dniEstudiante: string;

    @IsString()
    @IsNotEmpty()
    nombreEstudiante: string;

    @IsString()
    @IsNotEmpty()
    apellidoPaterno: string;

    @IsString()
    @IsNotEmpty()
    apellidoMaterno: string;

    @IsInt()
    idEscuela: number;
}

import { IsString, IsNotEmpty, IsInt, MinLength } from 'class-validator';

export class CreateEstudianteDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(8) // Assuming DNI is at least 8 chars
    dniEstudiante: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    nombreEstudiante: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    apellidoPaterno: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    apellidoMaterno: string;

    @IsInt()
    idEscuela: number;
}

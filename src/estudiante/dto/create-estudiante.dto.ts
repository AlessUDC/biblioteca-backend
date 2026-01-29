import { IsString, IsNotEmpty, IsInt, MinLength } from 'class-validator';

export class CreateEstudianteDto {
    @IsString()
    @IsNotEmpty()
    tipoDocumento: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8) // Assuming DNI is at least 8 chars
    numeroDocumento: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    nombre: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    apellidoPaterno: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    apellidoMaterno: string;

    @IsInt()
    escuelaId: number;
}

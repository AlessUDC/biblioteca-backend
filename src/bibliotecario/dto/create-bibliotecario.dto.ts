import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateBibliotecarioDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    nombreBibliotecario: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    apellidoPaterno: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    apellidoMaterno: string;
}

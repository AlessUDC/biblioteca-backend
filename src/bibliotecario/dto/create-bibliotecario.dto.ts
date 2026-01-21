import { IsString, IsNotEmpty } from 'class-validator';

export class CreateBibliotecarioDto {
    @IsString()
    @IsNotEmpty()
    nombreBibliotecario: string;

    @IsString()
    @IsNotEmpty()
    apellidoPaterno: string;

    @IsString()
    @IsNotEmpty()
    apellidoMaterno: string;
}

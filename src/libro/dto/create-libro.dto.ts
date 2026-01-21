import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateLibroDto {
    @IsString()
    @IsNotEmpty()
    nombreLibro: string;

    @IsInt()
    idArea: number;

    @IsInt()
    idEditorial: number;
}

import { IsString, IsNotEmpty, IsInt, IsArray, ArrayMinSize, MinLength } from 'class-validator';

export class CreateLibroDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    nombreLibro: string;

    @IsInt()
    idArea: number;

    @IsInt()
    idEditorial: number;

    @IsArray()
    @ArrayMinSize(1)
    @IsInt({ each: true })
    autoresIds: number[];
}

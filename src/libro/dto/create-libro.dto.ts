import { IsString, IsNotEmpty, IsInt, IsArray, ArrayMinSize, MinLength } from 'class-validator';

export class CreateLibroDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    nombre: string;

    @IsInt()
    categoriaId: number;

    @IsInt()
    editorialId: number;

    @IsArray()
    @ArrayMinSize(1)
    @IsInt({ each: true })
    autoresIds: number[];
}

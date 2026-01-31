import { IsString, IsNotEmpty, IsInt, IsArray, ArrayMinSize, MinLength } from 'class-validator';

export class CreateLibroDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    nombre: string;

    @IsArray()
    @ArrayMinSize(1)
    @IsInt({ each: true })
    categoriasIds: number[];

    @IsArray()
    @ArrayMinSize(1)
    @IsInt({ each: true })
    editorialesIds: number[];

    @IsArray()
    @ArrayMinSize(1)
    @IsInt({ each: true })
    autoresIds: number[];
}

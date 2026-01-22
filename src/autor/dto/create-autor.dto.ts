import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateAutorDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    nombreAutor: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    apellidoPaterno: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    apellidoMaterno: string;

    @IsString()
    @IsOptional()
    ORCID?: string;
}

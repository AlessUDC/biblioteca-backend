import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAutorDto {
    @IsString()
    @IsNotEmpty()
    nombreAutor: string;

    @IsString()
    @IsNotEmpty()
    apellidoPaterno: string;

    @IsString()
    @IsNotEmpty()
    apellidoMaterno: string;

    @IsString()
    @IsOptional()
    ORCID?: string;
}

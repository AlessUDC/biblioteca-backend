import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateAutorDto {
    @IsString()
    @IsOptional()
    nombre: string;

    @IsString()
    @IsOptional()
    apellidoPaterno?: string;

    @IsString()
    @IsOptional()
    apellidoMaterno?: string;

    @IsString()
    @IsOptional()
    nacionalidad?: string;

    @IsString()
    @IsOptional()
    ORCID?: string;
}

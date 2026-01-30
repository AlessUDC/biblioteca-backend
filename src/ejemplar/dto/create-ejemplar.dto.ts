import { IsInt, Min, IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export class CreateEjemplarDto {
    @IsInt()
    @Min(1)
    codigoLibro: number;

    @IsString()
    @IsNotEmpty()
    ubicacion: string;

    @IsOptional()
    @IsEnum(['DISPONIBLE', 'PRESTADO', 'REPARACION', 'PERDIDO'], {
        message: 'estado debe ser uno de: DISPONIBLE, PRESTADO, REPARACION, PERDIDO',
    })
    estado?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional() // Made optional as per my plan, can be strict if needed
    codigoBarras?: string;
}

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

    @IsInt()
    @Min(0)
    @IsOptional()
    cantidadTotal?: number;

    @IsInt()
    @Min(0)
    @IsOptional()
    cantidadDisponible?: number;
}

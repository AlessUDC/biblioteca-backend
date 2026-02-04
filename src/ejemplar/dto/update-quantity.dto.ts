import { IsInt, Min, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateQuantityDto {
    @IsInt()
    @Min(0)
    cantidad: number;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    ubicacion?: string;
}
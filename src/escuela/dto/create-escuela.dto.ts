import { IsString, IsNotEmpty, IsInt, MinLength } from 'class-validator';

export class CreateEscuelaDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    nombre: string;

    @IsInt()
    facultadId: number;
}

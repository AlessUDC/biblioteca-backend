import { IsString, IsNotEmpty, IsInt, MinLength } from 'class-validator';

export class CreateEscuelaDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    nombreEscuela: string;

    @IsInt()
    idFacultad: number;
}

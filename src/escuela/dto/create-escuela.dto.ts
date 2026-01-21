import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateEscuelaDto {
    @IsString()
    @IsNotEmpty()
    nombreEscuela: string;

    @IsInt()
    idFacultad: number;
}

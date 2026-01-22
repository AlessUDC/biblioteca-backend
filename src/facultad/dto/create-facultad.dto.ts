import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateFacultadDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    nombreFacultad: string;
}

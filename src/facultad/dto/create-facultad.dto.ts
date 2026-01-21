import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFacultadDto {
    @IsString()
    @IsNotEmpty()
    nombreFacultad: string;
}

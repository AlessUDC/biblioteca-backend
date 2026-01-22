import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateAreaDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    nombreArea: string;
}

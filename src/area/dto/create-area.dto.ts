import { IsString, IsNotEmpty } from 'class-validator';

export class CreateAreaDto {
    @IsString()
    @IsNotEmpty()
    nombreArea: string;
}

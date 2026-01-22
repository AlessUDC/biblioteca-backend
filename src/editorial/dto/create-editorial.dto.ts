import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateEditorialDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    nombreEditorial: string;
}

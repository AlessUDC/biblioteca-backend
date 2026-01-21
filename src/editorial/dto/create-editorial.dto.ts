import { IsString, IsNotEmpty } from 'class-validator';

export class CreateEditorialDto {
    @IsString()
    @IsNotEmpty()
    nombreEditorial: string;
}

import { IsInt } from 'class-validator';

export class CreateEjemplarDto {
    @IsInt()
    codigoLibro: number;
}

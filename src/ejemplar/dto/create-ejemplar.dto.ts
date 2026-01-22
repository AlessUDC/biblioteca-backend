import { IsInt, Min } from 'class-validator';

export class CreateEjemplarDto {
    @IsInt()
    @Min(1)
    codigoLibro: number;
}

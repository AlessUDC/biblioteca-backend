import { Expose } from 'class-transformer';

export class AutorResponseDto {
    @Expose()
    idAutor: number;

    @Expose()
    nombreAutor: string;

    @Expose()
    apellidoPaterno: string;

    @Expose()
    apellidoMaterno: string;

    @Expose()
    ORCID: string;

    constructor(partial: Partial<AutorResponseDto>) {
        Object.assign(this, partial);
    }
}

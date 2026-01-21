import { PartialType } from '@nestjs/mapped-types';
import { CreateBibliotecarioDto } from './create-bibliotecario.dto';

export class UpdateBibliotecarioDto extends PartialType(CreateBibliotecarioDto) { }

import { PartialType } from '@nestjs/mapped-types';
import { CreateEjemplarDto } from './create-ejemplar.dto';

export class UpdateEjemplarDto extends PartialType(CreateEjemplarDto) { }

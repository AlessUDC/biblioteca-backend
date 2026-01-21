import { Module } from '@nestjs/common';
import { FacultadService } from './facultad.service';
import { FacultadController } from './facultad.controller';

@Module({
    controllers: [FacultadController],
    providers: [FacultadService],
})
export class FacultadModule { }

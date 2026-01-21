import { Module } from '@nestjs/common';
import { AutorService } from './autor.service';
import { AutorController } from './autor.controller';

@Module({
    controllers: [AutorController],
    providers: [AutorService],
})
export class AutorModule { }

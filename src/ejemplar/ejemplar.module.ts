import { Module } from '@nestjs/common';
import { EjemplarService } from './ejemplar.service';
import { EjemplarController } from './ejemplar.controller';

@Module({
    controllers: [EjemplarController],
    providers: [EjemplarService],
})
export class EjemplarModule { }

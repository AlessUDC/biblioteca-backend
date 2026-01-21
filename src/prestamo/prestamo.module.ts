import { Module } from '@nestjs/common';
import { PrestamoService } from './prestamo.service';
import { PrestamoController } from './prestamo.controller';

@Module({
    controllers: [PrestamoController],
    providers: [PrestamoService],
})
export class PrestamoModule { }

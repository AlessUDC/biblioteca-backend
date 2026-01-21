import { Module } from '@nestjs/common';
import { BibliotecarioService } from './bibliotecario.service';
import { BibliotecarioController } from './bibliotecario.controller';

@Module({
    controllers: [BibliotecarioController],
    providers: [BibliotecarioService],
})
export class BibliotecarioModule { }

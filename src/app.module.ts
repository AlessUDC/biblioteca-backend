import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { FacultadModule } from './facultad/facultad.module';
import { EscuelaModule } from './escuela/escuela.module';
import { EstudianteModule } from './estudiante/estudiante.module';
import { BibliotecarioModule } from './bibliotecario/bibliotecario.module';
import { CategoriaModule } from './categoria/categoria.module';
import { EditorialModule } from './editorial/editorial.module';
import { AutorModule } from './autor/autor.module';
import { LibroModule } from './libro/libro.module';
import { EjemplarModule } from './ejemplar/ejemplar.module';
import { PrestamoModule } from './prestamo/prestamo.module';

@Module({
  imports: [
    PrismaModule,
    FacultadModule,
    EscuelaModule,
    EstudianteModule,
    BibliotecarioModule,
    CategoriaModule,
    EditorialModule,
    AutorModule,
    LibroModule,
    EjemplarModule,
    PrestamoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

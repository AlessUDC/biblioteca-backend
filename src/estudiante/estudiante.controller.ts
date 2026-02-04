import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';

@Controller('estudiante')
export class EstudianteController {
    constructor(private readonly estudianteService: EstudianteService) { }

    @Post()
    create(@Body() createEstudianteDto: CreateEstudianteDto) {
        return this.estudianteService.create(createEstudianteDto);
    }

    @Get()
    findAll() {
        return this.estudianteService.findAll();
    }

    @Get('buscar/:tipo/:numero')
    findByDocument(@Param('tipo') tipo: string, @Param('numero') numero: string) {
        return this.estudianteService.findByDocument(tipo, numero);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.estudianteService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateEstudianteDto: UpdateEstudianteDto) {
        return this.estudianteService.update(+id, updateEstudianteDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.estudianteService.remove(+id);
    }

    @Patch(':id/sancionar')
    sancionar(@Param('id') id: string) {
        return this.estudianteService.sancionar(+id);
    }

    @Patch(':id/quitar-sancion')
    quitarSancion(@Param('id') id: string) {
        return this.estudianteService.quitarSancion(+id);
    }
}

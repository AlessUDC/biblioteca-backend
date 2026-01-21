import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BibliotecarioService } from './bibliotecario.service';
import { CreateBibliotecarioDto } from './dto/create-bibliotecario.dto';
import { UpdateBibliotecarioDto } from './dto/update-bibliotecario.dto';

@Controller('bibliotecario')
export class BibliotecarioController {
    constructor(private readonly bibliotecarioService: BibliotecarioService) { }

    @Post()
    create(@Body() createBibliotecarioDto: CreateBibliotecarioDto) {
        return this.bibliotecarioService.create(createBibliotecarioDto);
    }

    @Get()
    findAll() {
        return this.bibliotecarioService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.bibliotecarioService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateBibliotecarioDto: UpdateBibliotecarioDto) {
        return this.bibliotecarioService.update(+id, updateBibliotecarioDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.bibliotecarioService.remove(+id);
    }
}

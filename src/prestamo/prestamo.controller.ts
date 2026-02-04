import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PrestamoService } from './prestamo.service';
import { CreatePrestamoDto } from './dto/create-prestamo.dto';
import { UpdatePrestamoDto } from './dto/update-prestamo.dto';

@Controller('prestamo')
export class PrestamoController {
    constructor(private readonly prestamoService: PrestamoService) { }

    @Post()
    create(@Body() createPrestamoDto: CreatePrestamoDto) {
        return this.prestamoService.create(createPrestamoDto);
    }

    @Get('estudiante/:id')
    findByStudent(@Param('id') id: string) {
        return this.prestamoService.findByStudent(+id);
    }

    @Get()
    findAll() {
        return this.prestamoService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.prestamoService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updatePrestamoDto: UpdatePrestamoDto) {
        return this.prestamoService.update(+id, updatePrestamoDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.prestamoService.remove(+id);
    }
}

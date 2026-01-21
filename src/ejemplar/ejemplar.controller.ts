import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EjemplarService } from './ejemplar.service';
import { CreateEjemplarDto } from './dto/create-ejemplar.dto';
import { UpdateEjemplarDto } from './dto/update-ejemplar.dto';

@Controller('ejemplar')
export class EjemplarController {
    constructor(private readonly ejemplarService: EjemplarService) { }

    @Post()
    create(@Body() createEjemplarDto: CreateEjemplarDto) {
        return this.ejemplarService.create(createEjemplarDto);
    }

    @Get()
    findAll() {
        return this.ejemplarService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ejemplarService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateEjemplarDto: UpdateEjemplarDto) {
        return this.ejemplarService.update(+id, updateEjemplarDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.ejemplarService.remove(+id);
    }
}

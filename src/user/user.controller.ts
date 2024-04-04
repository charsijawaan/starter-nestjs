import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PrismaService } from 'src/db-config/db-config.service';

@Controller('user')
export class UserController {
  constructor(private readonly prisma: PrismaService) {}
  @Post()
  create(@Request() req, @Body() body) {}

  @Get()
  async findAll() {
    return await this.prisma.brands.findMany();
  }
  @UseGuards()
  @Get('/my')
  findAllUsers() {
    return 'all users 2';
  }
  @Get(':id')
  findOne(@Param('id') id: string) {}

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto) {}

  @Delete(':id')
  remove(@Param('id') id: string) {}
}

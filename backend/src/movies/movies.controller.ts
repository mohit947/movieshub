import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Delete,
  Query,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { MoviesService } from './movies.service';
import { Request } from 'express';
import { CreateMovieDto } from './dto/create-movie.dto';
import { Param, Put } from '@nestjs/common';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @UseGuards(SupabaseAuthGuard)
  @Get()
  async getMovies(
    @Req() req: Request,
    @Query('page') page = 1,
    @Query('limit') limit = 8,
  ) {
    const userId = (req as any).user.sub;
    return this.moviesService.getMoviesByUserPaginated(userId, +page, +limit);
  }

  @UseGuards(SupabaseAuthGuard)
  @Post()
  async createMovie(@Body() dto: CreateMovieDto, @Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.moviesService.createMovie(dto, userId);
  }

  @UseGuards(SupabaseAuthGuard)
  @Put(':id')
  async updateMovie(
    @Param('id') id: string,
    @Body() dto: UpdateMovieDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user.sub;
    return this.moviesService.updateMovie(id, dto, userId);
  }
  @UseGuards(SupabaseAuthGuard)
  @Delete(':id')
  async deleteMovie(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.moviesService.deleteMovie(id, userId);
  }
}

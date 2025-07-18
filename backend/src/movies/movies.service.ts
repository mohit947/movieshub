import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../shared/supabase.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Injectable()
export class MoviesService {
  constructor(private supabase: SupabaseService) {}

  async getMoviesByUser(userId: string) {
    const { data, error } = await this.supabase.client
      .from('movies')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  }

  async createMovie(dto: CreateMovieDto, userId: string) {
    const { data, error } = await this.supabase.client.from('movies').insert({
      ...dto,
      user_id: userId,
    });

    if (error) throw error;
    return data;
  }

  async updateMovie(id: string, dto: UpdateMovieDto, userId: string) {
    const { data, error } = await this.supabase.client
      .from('movies')
      .update(dto)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteMovie(id: string, userId: string) {
    const { error } = await this.supabase.client
      .from('movies')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return { message: 'Movie deleted' };
  }

  async getMoviesByUserPaginated(userId: string, page: number, limit: number) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await this.supabase.client
      .from('movies')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .range(from, to);

    if (error) throw error;

    return { data, total: count, page, limit };
  }
}

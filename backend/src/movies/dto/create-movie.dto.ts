import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMovieDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  publishing_year: number;

  @IsString()
  @IsOptional()
  poster_url?: string;
}

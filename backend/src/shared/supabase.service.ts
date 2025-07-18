import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  public client;

  constructor(private config: ConfigService) {
    const url = config.get<string>('SUPABASE_URL')!;
    const key = config.get<string>('SUPABASE_SERVICE_ROLE_KEY')!;
    this.client = createClient(url, key);
  }
}

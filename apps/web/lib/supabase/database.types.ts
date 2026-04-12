// Phase 1-2 テーブルの型定義
// Database_Schema_v5_1.md をもとに手動で作成
// Phase 3以降でSupabase CLIによる自動生成に移行予定

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          device_id: string;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          device_id: string;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          device_id?: string;
          display_name?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      oshis: {
        Row: {
          id: string;
          name: string;
          group_name: string | null;
          category: 'idol' | 'kpop' | 'anime' | 'voice_actor' | 'other';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          group_name?: string | null;
          category?: 'idol' | 'kpop' | 'anime' | 'voice_actor' | 'other';
          created_at?: string;
        };
        Update: {
          name?: string;
          group_name?: string | null;
          category?: 'idol' | 'kpop' | 'anime' | 'voice_actor' | 'other';
        };
        Relationships: [];
      };
      areas: {
        Row: {
          id: string;
          name: string;
          prefecture: string;
          bounds: string | null; // GEOGRAPHY(POLYGON) はstring型で受け取る
          total_spots: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          prefecture: string;
          bounds?: string | null;
          total_spots?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          prefecture?: string;
          bounds?: string | null;
          total_spots?: number;
        };
        Relationships: [];
      };
      user_oshis: {
        Row: {
          id: string;
          user_id: string;
          oshi_id: string;
          theme_color: string;
          is_primary: boolean;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          oshi_id: string;
          theme_color?: string;
          is_primary?: boolean;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          theme_color?: string;
          is_primary?: boolean;
          display_order?: number;
        };
        Relationships: [];
      };
      spots: {
        Row: {
          id: string;
          location: string; // GEOGRAPHY(POINT) はstring型で受け取る
          address: string | null;
          area_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          location: string;
          address?: string | null;
          area_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          location?: string;
          address?: string | null;
          area_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          spot_id: string;
          oshi_id: string;
          user_id: string | null;
          category: 'ooh' | 'popup' | 'event' | 'other';
          comment: string | null;
          start_date: string;
          end_date: string;
          taken_at: string | null;
          taken_location: string | null; // GEOGRAPHY(POINT)
          status: 'active' | 'expired' | 'deleted';
          reply_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          spot_id: string;
          oshi_id: string;
          user_id?: string | null;
          category: 'ooh' | 'popup' | 'event' | 'other';
          comment?: string | null;
          start_date: string;
          end_date: string;
          taken_at?: string | null;
          taken_location?: string | null;
          status?: 'active' | 'expired' | 'deleted';
          reply_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          spot_id?: string;
          oshi_id?: string;
          user_id?: string | null;
          category?: 'ooh' | 'popup' | 'event' | 'other';
          comment?: string | null;
          start_date?: string;
          end_date?: string;
          taken_at?: string | null;
          taken_location?: string | null;
          status?: 'active' | 'expired' | 'deleted';
          reply_count?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      post_images: {
        Row: {
          id: string;
          post_id: string;
          image_url: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          image_url: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          image_url?: string;
          display_order?: number;
        };
        Relationships: [];
      };
      check_ins: {
        Row: {
          id: string;
          user_id: string;
          spot_id: string;
          checked_at: string;
          checked_date: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          spot_id: string;
          checked_at?: string;
          checked_date?: string;
        };
        Update: {
          checked_at?: string;
          checked_date?: string;
        };
        Relationships: [];
      };
      visit_logs: {
        Row: {
          id: string;
          user_id: string;
          spot_id: string;
          oshi_id: string;
          location: string; // GEOGRAPHY(POINT)
          visited_at: string;
          source: 'checkin' | 'exif' | 'manual';
        };
        Insert: {
          id?: string;
          user_id: string;
          spot_id: string;
          oshi_id: string;
          location: string;
          visited_at?: string;
          source?: 'checkin' | 'exif' | 'manual';
        };
        Update: {
          location?: string;
          visited_at?: string;
          source?: 'checkin' | 'exif' | 'manual';
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

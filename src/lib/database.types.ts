export type Database = {
  public: {
    Tables: {
      lists: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
        };
      };
      list_items: {
        Row: {
          id: string;
          list_id: string;
          lemma: string;
          root: string | null;
          meaning: string;
          arabic: string;
          source_word_id: string;
          added_at: string;
          status: string;
        };
        Insert: {
          id?: string;
          list_id: string;
          lemma: string;
          root?: string | null;
          meaning: string;
          arabic: string;
          source_word_id: string;
          added_at?: string;
          status?: string;
        };
        Update: {
          id?: string;
          list_id?: string;
          lemma?: string;
          root?: string | null;
          meaning?: string;
          arabic?: string;
          source_word_id?: string;
          added_at?: string;
          status?: string;
        };
      };
    };
  };
};

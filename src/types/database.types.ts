export type UserRole = 'admin' | 'bendahara' | 'pendataan' | 'acara';

export type CurrencyCode = 'IDR' | 'EGP';

export type CashbookType = 'income' | 'expense';

export type DivisionCode =
  | 'Badan Pengurus Harian'
  | 'Divisi Acara'
  | 'Divisi Pendataan'
  | 'Divisi Media'
  | 'Divisi Humas'
  | 'Divisi Logistik';

export type ShirtSize = 'large' | 'small';

export type VerificationStatus = 'done' | 'not_yet';

export interface ProfileRow {
  id: string;
  username: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;

        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          role: UserRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };

        Update: {
          id?: string;
          username?: string;
          full_name?: string | null;
          role?: UserRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };

        Relationships: [];
      };

      // Append-only. No updated_at, no Update shape offered.
      audit_logs: {
        Row: {
          id: string;
          actor_id: string;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };

        Insert: {
          id?: string;
          actor_id: string;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };

        Update: {
          id?: string;
          actor_id?: string;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };

        Relationships: [];
      };

      rab_items: {
        Row: {
          id: string;
          item_name: string;
          quantity: number | null;
          unit: string | null;
          division: DivisionCode;
          estimated_cost: number;
          currency: CurrencyCode;
          description: string | null;
          created_by: string;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };

        Insert: {
          id?: string;
          item_name: string;
          quantity?: number | null;
          unit?: string | null;
          division: DivisionCode;
          estimated_cost: number;
          currency: CurrencyCode;
          description?: string | null;
          // created_by/updated_by are set server-side by the
          // set_audit_columns trigger — never sent by the client.
          created_by?: string;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };

        Update: {
          id?: string;
          item_name?: string;
          quantity?: number | null;
          unit?: string | null;
          division?: DivisionCode;
          estimated_cost?: number;
          currency?: CurrencyCode;
          description?: string | null;
          created_by?: string;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };

        Relationships: [];
      };

      cashbook_entries: {
        Row: {
          id: string;
          transaction_date: string;
          type: CashbookType;
          category: string;
          description: string | null;
          division: DivisionCode | null;
          currency: CurrencyCode;
          amount: number;
          payment_method: string;
          pic: string | null;
          attachment_url: string | null;
          created_by: string;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };

        Insert: {
          id?: string;
          transaction_date: string;
          type: CashbookType;
          category: string;
          description?: string | null;
          division?: DivisionCode | null;
          currency: CurrencyCode;
          amount: number;
          payment_method: string;
          pic?: string | null;
          attachment_url?: string | null;
          created_by?: string;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };

        Update: {
          id?: string;
          transaction_date?: string;
          type?: CashbookType;
          category?: string;
          description?: string | null;
          division?: DivisionCode | null;
          currency?: CurrencyCode;
          amount?: number;
          payment_method?: string;
          pic?: string | null;
          attachment_url?: string | null;
          created_by?: string;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };

        Relationships: [];
      };

      graduates: {
        Row: {
          id: string;
          full_name: string;
          full_name_ar: string | null;
          country_code: string | null;
          shirt_size: ShirtSize | null;
          verification_status: VerificationStatus;
          participant_number: string | null;
          whatsapp_number: string | null;
          created_by: string;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };

        Insert: {
          id?: string;
          full_name: string;
          full_name_ar?: string | null;
          country_code?: string | null;
          shirt_size?: ShirtSize | null;
          verification_status?: VerificationStatus;
          participant_number?: string | null;
          whatsapp_number?: string | null;
          created_by?: string;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };

        Update: {
          id?: string;
          full_name?: string;
          full_name_ar?: string | null;
          country_code?: string | null;
          shirt_size?: ShirtSize | null;
          verification_status?: VerificationStatus;
          participant_number?: string | null;
          whatsapp_number?: string | null;
          created_by?: string;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };

        Relationships: [];
      };

      // NOTE: both `person_in_charge` (original column) and `pic`
      // (added by the domain-refinement migration) exist side by
      // side and appear to describe the same concept ("PIC").
      // Kept as-is here to match the real schema exactly — flagged
      // separately, not something this type file should paper over.
      rundown_items: {
        Row: {
          id: string;
          activity: string;
          start_time: string;
          end_time: string | null;
          duration_minutes: number | null;
          officer: string | null;
          person_in_charge: string | null;
          pic: string | null;
          needs: string | null;
          location: string | null;
          notes: string | null;
          sort_order: number;
          created_by: string;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };

        Insert: {
          id?: string;
          activity: string;
          start_time: string;
          end_time?: string | null;
          duration_minutes?: number | null;
          officer?: string | null;
          person_in_charge?: string | null;
          pic?: string | null;
          needs?: string | null;
          location?: string | null;
          notes?: string | null;
          sort_order: number;
          created_by?: string;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };

        Update: {
          id?: string;
          activity?: string;
          start_time?: string;
          end_time?: string | null;
          duration_minutes?: number | null;
          officer?: string | null;
          person_in_charge?: string | null;
          pic?: string | null;
          needs?: string | null;
          location?: string | null;
          notes?: string | null;
          sort_order?: number;
          created_by?: string;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };

        Relationships: [];
      };
    };

    Views: {};

    Functions: {
      admin_update_user: {
        Args: {
          p_target_user_id: string;
          p_new_role: UserRole | null;
          p_new_is_active: boolean | null;
        };
        Returns: ProfileRow;
      };

      current_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: UserRole;
      };
    };

    Enums: {
      user_role: UserRole;
      currency_code: CurrencyCode;
      cashbook_type: CashbookType;
      division_code: DivisionCode;
      shirt_size: ShirtSize;
      verification_status: VerificationStatus;
    };

    CompositeTypes: {};
  };
}

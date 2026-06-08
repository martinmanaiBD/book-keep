import type { PaymentRecord } from "@/lib/payments";

export type Database = {
  public: {
    Tables: {
      payments: {
        Row: PaymentRecord;
        Insert: {
          payer_name: string;
          payment_date: string;
          payment_month: string;
          amount: number;
          paid_at?: string;
          remarks?: string | null;
        };
        Update: {
          payer_name?: string;
          payment_date?: string;
          payment_month?: string;
          amount?: number;
          paid_at?: string;
          remarks?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

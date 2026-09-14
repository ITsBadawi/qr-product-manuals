export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Product {
  id: string;
  user_id: string;
  name: string;
  sku: string | null;
  description: string | null;
  pdf_path: string;
  pdf_original_name: string;
  pdf_size: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ProductInsert = {
  id?: string;
  user_id: string;
  name: string;
  sku?: string | null;
  description?: string | null;
  pdf_path: string;
  pdf_original_name: string;
  pdf_size: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ProductUpdate = {
  id?: string;
  user_id?: string;
  name?: string;
  sku?: string | null;
  description?: string | null;
  pdf_path?: string;
  pdf_original_name?: string;
  pdf_size?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: ProductInsert;
        Update: ProductUpdate;
        Relationships: [
          {
            foreignKeyName: "products_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

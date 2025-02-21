export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      contract_templates: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          original_filename: string | null
          processed_content: string | null
          status: string | null
          template_variables: Json | null
          updated_at: string
          version: number | null
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          original_filename?: string | null
          processed_content?: string | null
          status?: string | null
          template_variables?: Json | null
          updated_at?: string
          version?: number | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          original_filename?: string | null
          processed_content?: string | null
          status?: string | null
          template_variables?: Json | null
          updated_at?: string
          version?: number | null
        }
        Relationships: []
      }
      contracts: {
        Row: {
          content: string
          created_at: string | null
          document_id: string | null
          file_path: string | null
          generated_at: string | null
          id: string
          metadata: Json | null
          preview_url: string | null
          status: Database["public"]["Enums"]["contract_status"] | null
          template_id: string | null
          title: string
          updated_at: string | null
          user_id: string | null
          variables: Json | null
          version: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          document_id?: string | null
          file_path?: string | null
          generated_at?: string | null
          id?: string
          metadata?: Json | null
          preview_url?: string | null
          status?: Database["public"]["Enums"]["contract_status"] | null
          template_id?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          variables?: Json | null
          version?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          document_id?: string | null
          file_path?: string | null
          generated_at?: string | null
          id?: string
          metadata?: Json | null
          preview_url?: string | null
          status?: Database["public"]["Enums"]["contract_status"] | null
          template_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          variables?: Json | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "processed_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "contract_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      library_books: {
        Row: {
          author: string | null
          cover_image: string | null
          created_at: string
          description: string | null
          file_path: string
          file_size: number | null
          id: string
          last_page: number | null
          title: string
          total_pages: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          author?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          file_path: string
          file_size?: number | null
          id?: string
          last_page?: number | null
          title: string
          total_pages?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          author?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          file_path?: string
          file_size?: number | null
          id?: string
          last_page?: number | null
          title?: string
          total_pages?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      processed_documents: {
        Row: {
          created_at: string | null
          document_gender: string | null
          document_role:
            | Database["public"]["Enums"]["document_role_enum"]
            | null
          document_type: Database["public"]["Enums"]["document_type"]
          error_message: string | null
          extracted_data: Json | null
          extracted_fields: Json | null
          file_name: string
          file_path: string
          file_type: string | null
          id: string
          marital_status:
            | Database["public"]["Enums"]["marital_status_enum"]
            | null
          processed_at: string | null
          shared_address: boolean
          spouse_document_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          document_gender?: string | null
          document_role?:
            | Database["public"]["Enums"]["document_role_enum"]
            | null
          document_type?: Database["public"]["Enums"]["document_type"]
          error_message?: string | null
          extracted_data?: Json | null
          extracted_fields?: Json | null
          file_name: string
          file_path: string
          file_type?: string | null
          id?: string
          marital_status?:
            | Database["public"]["Enums"]["marital_status_enum"]
            | null
          processed_at?: string | null
          shared_address?: boolean
          spouse_document_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          document_gender?: string | null
          document_role?:
            | Database["public"]["Enums"]["document_role_enum"]
            | null
          document_type?: Database["public"]["Enums"]["document_type"]
          error_message?: string | null
          extracted_data?: Json | null
          extracted_fields?: Json | null
          file_name?: string
          file_path?: string
          file_type?: string | null
          id?: string
          marital_status?:
            | Database["public"]["Enums"]["marital_status_enum"]
            | null
          processed_at?: string | null
          shared_address?: boolean
          spouse_document_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "processed_documents_spouse_document_id_fkey"
            columns: ["spouse_document_id"]
            isOneToOne: false
            referencedRelation: "processed_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string
          city: string
          created_at: string
          id: string
          income: number | null
          observations: string | null
          quantity: number
          tenant: string | null
          type: Database["public"]["Enums"]["property_type"]
          updated_at: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          id?: string
          income?: number | null
          observations?: string | null
          quantity?: number
          tenant?: string | null
          type: Database["public"]["Enums"]["property_type"]
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          id?: string
          income?: number | null
          observations?: string | null
          quantity?: number
          tenant?: string | null
          type?: Database["public"]["Enums"]["property_type"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      contract_status: "draft" | "pending" | "active" | "expired" | "cancelled"
      document_role_enum:
        | "locador"
        | "locadora"
        | "locatario"
        | "locataria"
        | "fiador"
        | "fiadora"
      document_type: "documentos_pessoais" | "comprovante_endereco"
      document_type_new: "documentos_pessoais" | "comprovante_endereco"
      marital_status: "solteiro" | "casado" | "divorciado" | "viuvo"
      marital_status_enum: "solteiro" | "casado" | "divorciado" | "viuvo"
      property_type: "casa" | "apartamento" | "comercial" | "rural" | "terreno"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

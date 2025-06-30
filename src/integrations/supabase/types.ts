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
      document_chunks: {
        Row: {
          chunk_index: number
          chunk_text: string
          created_at: string
          document_name: string
          embedding: string | null
          id: string
          updated_at: string
        }
        Insert: {
          chunk_index: number
          chunk_text: string
          created_at?: string
          document_name: string
          embedding?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          chunk_index?: number
          chunk_text?: string
          created_at?: string
          document_name?: string
          embedding?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      document_processing: {
        Row: {
          chunks_count: number | null
          created_at: string
          document_name: string
          error_message: string | null
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          chunks_count?: number | null
          created_at?: string
          document_name: string
          error_message?: string | null
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          chunks_count?: number | null
          created_at?: string
          document_name?: string
          error_message?: string | null
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      Energy_efficiency_RAG: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      exam_sessions: {
        Row: {
          completed_at: string | null
          correct_answers: number
          id: string
          score_percentage: number
          subject: string
          time_taken: number
          total_questions: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          correct_answers?: number
          id?: string
          score_percentage?: number
          subject?: string
          time_taken?: number
          total_questions?: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          correct_answers?: number
          id?: string
          score_percentage?: number
          subject?: string
          time_taken?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: []
      }
      page_units: {
        Row: {
          correct_answer: string | null
          created_at: string | null
          explanation: string | null
          id: string
          image_description: string | null
          key_terms: string[] | null
          page_image_url: string | null
          page_number: number
          page_text: string | null
          pdf_document_id: string | null
          pdf_name: string
          processing_status: string | null
          question_type: string | null
          quiz_options: Json | null
          quiz_question: string | null
          summary: string | null
          updated_at: string | null
        }
        Insert: {
          correct_answer?: string | null
          created_at?: string | null
          explanation?: string | null
          id?: string
          image_description?: string | null
          key_terms?: string[] | null
          page_image_url?: string | null
          page_number: number
          page_text?: string | null
          pdf_document_id?: string | null
          pdf_name: string
          processing_status?: string | null
          question_type?: string | null
          quiz_options?: Json | null
          quiz_question?: string | null
          summary?: string | null
          updated_at?: string | null
        }
        Update: {
          correct_answer?: string | null
          created_at?: string | null
          explanation?: string | null
          id?: string
          image_description?: string | null
          key_terms?: string[] | null
          page_image_url?: string | null
          page_number?: number
          page_text?: string | null
          pdf_document_id?: string | null
          pdf_name?: string
          processing_status?: string | null
          question_type?: string | null
          quiz_options?: Json | null
          quiz_question?: string | null
          summary?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_units_pdf_document_id_fkey"
            columns: ["pdf_document_id"]
            isOneToOne: false
            referencedRelation: "pdf_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      pdf_documents: {
        Row: {
          created_at: string | null
          error_message: string | null
          file_name: string
          file_size: number
          id: string
          original_name: string
          processing_progress: number | null
          storage_path: string
          total_pages: number | null
          updated_at: string | null
          upload_status: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          file_name: string
          file_size: number
          id?: string
          original_name: string
          processing_progress?: number | null
          storage_path: string
          total_pages?: number | null
          updated_at?: string | null
          upload_status?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          file_name?: string
          file_size?: number
          id?: string
          original_name?: string
          processing_progress?: number | null
          storage_path?: string
          total_pages?: number | null
          updated_at?: string | null
          upload_status?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          is_admin: boolean
        }
        Insert: {
          id: string
          is_admin?: boolean
        }
        Update: {
          id?: string
          is_admin?: boolean
        }
        Relationships: []
      }
      questions: {
        Row: {
          answer: string
          chapter: string
          content: string
          created_at: string | null
          difficulty: string
          explanation: string
          id: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          subject: string
          topic: string
        }
        Insert: {
          answer: string
          chapter?: string
          content: string
          created_at?: string | null
          difficulty?: string
          explanation?: string
          id?: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          subject?: string
          topic?: string
        }
        Update: {
          answer?: string
          chapter?: string
          content?: string
          created_at?: string | null
          difficulty?: string
          explanation?: string
          id?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          subject?: string
          topic?: string
        }
        Relationships: []
      }
      subject_one_questions: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
          知識點: string
          答案: string
          解析: string
          選項a: string
          選項b: string
          選項c: string
          選項d: string
          難度: Database["public"]["Enums"]["difficulty_level"]
          題目: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          知識點?: string
          答案: string
          解析?: string
          選項a: string
          選項b: string
          選項c: string
          選項d: string
          難度?: Database["public"]["Enums"]["difficulty_level"]
          題目: string
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          知識點?: string
          答案?: string
          解析?: string
          選項a?: string
          選項b?: string
          選項c?: string
          選項d?: string
          難度?: Database["public"]["Enums"]["difficulty_level"]
          題目?: string
        }
        Relationships: []
      }
      subject_two_questions: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
          知識點: string
          答案: string
          解析: string
          選項a: string
          選項b: string
          選項c: string
          選項d: string
          難度: Database["public"]["Enums"]["difficulty_level"]
          題目: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          知識點?: string
          答案: string
          解析?: string
          選項a: string
          選項b: string
          選項c: string
          選項d: string
          難度?: Database["public"]["Enums"]["difficulty_level"]
          題目: string
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          知識點?: string
          答案?: string
          解析?: string
          選項a?: string
          選項b?: string
          選項c?: string
          選項d?: string
          難度?: Database["public"]["Enums"]["difficulty_level"]
          題目?: string
        }
        Relationships: []
      }
      tcfd_assessments: {
        Row: {
          annual_revenue_range: string | null
          business_description: string | null
          company_size: string
          created_at: string
          current_stage: number
          has_carbon_inventory: boolean
          has_international_operations: boolean | null
          has_sustainability_team: string | null
          id: string
          industry: string
          is_demo_data: boolean | null
          main_emission_source: string | null
          status: string
          supply_chain_carbon_disclosure: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          annual_revenue_range?: string | null
          business_description?: string | null
          company_size: string
          created_at?: string
          current_stage?: number
          has_carbon_inventory?: boolean
          has_international_operations?: boolean | null
          has_sustainability_team?: string | null
          id?: string
          industry: string
          is_demo_data?: boolean | null
          main_emission_source?: string | null
          status?: string
          supply_chain_carbon_disclosure?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          annual_revenue_range?: string | null
          business_description?: string | null
          company_size?: string
          created_at?: string
          current_stage?: number
          has_carbon_inventory?: boolean
          has_international_operations?: boolean | null
          has_sustainability_team?: string | null
          id?: string
          industry?: string
          is_demo_data?: boolean | null
          main_emission_source?: string | null
          status?: string
          supply_chain_carbon_disclosure?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tcfd_financial_analysis_cache: {
        Row: {
          analysis_methodology: string | null
          balance_sheet_analysis: string | null
          cache_key: string
          calculation_method_suggestions: string | null
          cash_flow_analysis: string | null
          category_name: string
          category_type: string
          company_size: string
          created_at: string
          id: string
          industry: string
          profit_loss_analysis: string | null
          strategy_feasibility_analysis: string | null
          strategy_type: string
          subcategory_name: string | null
          updated_at: string
        }
        Insert: {
          analysis_methodology?: string | null
          balance_sheet_analysis?: string | null
          cache_key: string
          calculation_method_suggestions?: string | null
          cash_flow_analysis?: string | null
          category_name: string
          category_type: string
          company_size: string
          created_at?: string
          id?: string
          industry: string
          profit_loss_analysis?: string | null
          strategy_feasibility_analysis?: string | null
          strategy_type: string
          subcategory_name?: string | null
          updated_at?: string
        }
        Update: {
          analysis_methodology?: string | null
          balance_sheet_analysis?: string | null
          cache_key?: string
          calculation_method_suggestions?: string | null
          cash_flow_analysis?: string | null
          category_name?: string
          category_type?: string
          company_size?: string
          created_at?: string
          id?: string
          industry?: string
          profit_loss_analysis?: string | null
          strategy_feasibility_analysis?: string | null
          strategy_type?: string
          subcategory_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tcfd_reports: {
        Row: {
          assessment_id: string
          disclosure_matrix: Json | null
          generated_at: string
          governance_content: string | null
          id: string
          is_demo_data: boolean | null
          json_output: Json | null
          metrics_targets_content: string | null
          pdf_url: string | null
          report_format_content: string | null
          risk_management_content: string | null
          strategy_content: string | null
        }
        Insert: {
          assessment_id: string
          disclosure_matrix?: Json | null
          generated_at?: string
          governance_content?: string | null
          id?: string
          is_demo_data?: boolean | null
          json_output?: Json | null
          metrics_targets_content?: string | null
          pdf_url?: string | null
          report_format_content?: string | null
          risk_management_content?: string | null
          strategy_content?: string | null
        }
        Update: {
          assessment_id?: string
          disclosure_matrix?: Json | null
          generated_at?: string
          governance_content?: string | null
          id?: string
          is_demo_data?: boolean | null
          json_output?: Json | null
          metrics_targets_content?: string | null
          pdf_url?: string | null
          report_format_content?: string | null
          risk_management_content?: string | null
          strategy_content?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tcfd_reports_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "tcfd_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      tcfd_risk_opportunity_selections: {
        Row: {
          assessment_id: string
          category_name: string
          category_type: string
          created_at: string
          id: string
          is_demo_data: boolean | null
          selected: boolean
          subcategory_name: string | null
        }
        Insert: {
          assessment_id: string
          category_name: string
          category_type: string
          created_at?: string
          id?: string
          is_demo_data?: boolean | null
          selected?: boolean
          subcategory_name?: string | null
        }
        Update: {
          assessment_id?: string
          category_name?: string
          category_type?: string
          created_at?: string
          id?: string
          is_demo_data?: boolean | null
          selected?: boolean
          subcategory_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tcfd_risk_opportunity_selections_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "tcfd_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      tcfd_scenario_cache: {
        Row: {
          cache_key: string
          category_name: string
          category_type: string
          company_size: string
          created_at: string
          id: string
          industry: string
          scenario_description: string
          subcategory_name: string | null
          updated_at: string
        }
        Insert: {
          cache_key: string
          category_name: string
          category_type: string
          company_size: string
          created_at?: string
          id?: string
          industry: string
          scenario_description: string
          subcategory_name?: string | null
          updated_at?: string
        }
        Update: {
          cache_key?: string
          category_name?: string
          category_type?: string
          company_size?: string
          created_at?: string
          id?: string
          industry?: string
          scenario_description?: string
          subcategory_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tcfd_scenario_evaluations: {
        Row: {
          assessment_id: string
          created_at: string
          custom_scenario_context: string | null
          id: string
          is_demo_data: boolean | null
          llm_response: string | null
          risk_opportunity_id: string
          scenario_description: string
          scenario_generated_by_llm: boolean
          selected_strategy: string | null
          strategy_description: string | null
          strategy_type: Database["public"]["Enums"]["strategy_type"] | null
          user_score: number | null
        }
        Insert: {
          assessment_id: string
          created_at?: string
          custom_scenario_context?: string | null
          id?: string
          is_demo_data?: boolean | null
          llm_response?: string | null
          risk_opportunity_id: string
          scenario_description: string
          scenario_generated_by_llm?: boolean
          selected_strategy?: string | null
          strategy_description?: string | null
          strategy_type?: Database["public"]["Enums"]["strategy_type"] | null
          user_score?: number | null
        }
        Update: {
          assessment_id?: string
          created_at?: string
          custom_scenario_context?: string | null
          id?: string
          is_demo_data?: boolean | null
          llm_response?: string | null
          risk_opportunity_id?: string
          scenario_description?: string
          scenario_generated_by_llm?: boolean
          selected_strategy?: string | null
          strategy_description?: string | null
          strategy_type?: Database["public"]["Enums"]["strategy_type"] | null
          user_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tcfd_scenario_evaluations_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "tcfd_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tcfd_scenario_evaluations_risk_opportunity_id_fkey"
            columns: ["risk_opportunity_id"]
            isOneToOne: false
            referencedRelation: "tcfd_risk_opportunity_selections"
            referencedColumns: ["id"]
          },
        ]
      }
      tcfd_strategy_analysis: {
        Row: {
          assessment_id: string
          created_at: string
          detailed_description: string | null
          financial_impact_balance_sheet: string | null
          financial_impact_cashflow: string | null
          financial_impact_pnl: string | null
          generated_by_llm: boolean
          id: string
          is_demo_data: boolean | null
          scenario_evaluation_id: string
          selected_strategy: string | null
          strategy_accept: string | null
          strategy_avoid: string | null
          strategy_mitigate: string | null
          strategy_transfer: string | null
          user_modifications: string | null
        }
        Insert: {
          assessment_id: string
          created_at?: string
          detailed_description?: string | null
          financial_impact_balance_sheet?: string | null
          financial_impact_cashflow?: string | null
          financial_impact_pnl?: string | null
          generated_by_llm?: boolean
          id?: string
          is_demo_data?: boolean | null
          scenario_evaluation_id: string
          selected_strategy?: string | null
          strategy_accept?: string | null
          strategy_avoid?: string | null
          strategy_mitigate?: string | null
          strategy_transfer?: string | null
          user_modifications?: string | null
        }
        Update: {
          assessment_id?: string
          created_at?: string
          detailed_description?: string | null
          financial_impact_balance_sheet?: string | null
          financial_impact_cashflow?: string | null
          financial_impact_pnl?: string | null
          generated_by_llm?: boolean
          id?: string
          is_demo_data?: boolean | null
          scenario_evaluation_id?: string
          selected_strategy?: string | null
          strategy_accept?: string | null
          strategy_avoid?: string | null
          strategy_mitigate?: string | null
          strategy_transfer?: string | null
          user_modifications?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tcfd_strategy_analysis_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "tcfd_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tcfd_strategy_analysis_scenario_evaluation_id_fkey"
            columns: ["scenario_evaluation_id"]
            isOneToOne: false
            referencedRelation: "tcfd_scenario_evaluations"
            referencedColumns: ["id"]
          },
        ]
      }
      tcfd_strategy_cache: {
        Row: {
          cache_key: string
          category_name: string
          category_type: string
          company_size: string
          created_at: string
          id: string
          industry: string
          strategies: Json
          subcategory_name: string | null
          updated_at: string
        }
        Insert: {
          cache_key: string
          category_name: string
          category_type: string
          company_size: string
          created_at?: string
          id?: string
          industry: string
          strategies: Json
          subcategory_name?: string | null
          updated_at?: string
        }
        Update: {
          cache_key?: string
          category_name?: string
          category_type?: string
          company_size?: string
          created_at?: string
          id?: string
          industry?: string
          strategies?: Json
          subcategory_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_answers: {
        Row: {
          id: string
          is_correct: boolean
          mode: string
          question_id: string
          selected_option: string
          session_id: string | null
          timestamp: string | null
          user_id: string
        }
        Insert: {
          id?: string
          is_correct?: boolean
          mode?: string
          question_id: string
          selected_option?: string
          session_id?: string | null
          timestamp?: string | null
          user_id: string
        }
        Update: {
          id?: string
          is_correct?: boolean
          mode?: string
          question_id?: string
          selected_option?: string
          session_id?: string | null
          timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      difficulty_level: "basic" | "applied" | "integrated"
      question_type: "concept" | "scenario" | "calculation" | "regulation"
      strategy_type:
        | "mitigate"
        | "transfer"
        | "accept"
        | "control"
        | "explore"
        | "build"
        | "transform"
        | "collaborate"
        | "invest"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      difficulty_level: ["basic", "applied", "integrated"],
      question_type: ["concept", "scenario", "calculation", "regulation"],
      strategy_type: [
        "mitigate",
        "transfer",
        "accept",
        "control",
        "explore",
        "build",
        "transform",
        "collaborate",
        "invest",
      ],
    },
  },
} as const

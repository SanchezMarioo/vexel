export type LeadStatus =
  | "nuevo"
  | "contactado"
  | "llamada_agendada"
  | "propuesta_enviada"
  | "ganado"
  | "perdido";

export type LeadScoreTier = "alta" | "media" | "baja";

export interface Lead {
  id: string;
  created_at: string;
  updated_at: string;
  status: LeadStatus;
  
  // Contacto
  nombre: string;
  empresa: string | null;
  email: string;
  telefono: string | null;
  descripcion: string | null;
  
  // Respuestas del proyecto
  situacion: string;
  situacion_detalle: string | null;
  tipo: string;
  objetivo: string | null;
  catalogo: string | null;
  web_actual: string | null;
  presupuesto: string;
  plazo: string;
  
  // Atribución
  landing_page: string | null;
  form_page: string | null;
  current_url: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  
  // Score
  score_value: number;
  score_tier: LeadScoreTier;
  score_reasons: string[];
  
  // Metadatos
  is_update: boolean;
  notes: string | null;
  raw_answers: Record<string, unknown> | null;
}

export type LeadInsert = Omit<Lead, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type LeadUpdate = Partial<Omit<Lead, "id" | "created_at" | "updated_at">>;

export interface LeadStats {
  total: number;
  nuevo: number;
  contactado: number;
  llamada_agendada: number;
  propuesta_enviada: number;
  ganado: number;
  perdido: number;
}

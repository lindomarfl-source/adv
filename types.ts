export enum CaseStatus {
  ACTIVE = 'Ativo',
  PENDING = 'Pendente',
  CLOSED = 'Arquivado',
  URGENT = 'Urgente'
}

export interface Case {
  id: string;
  number: string;
  title: string;
  client: string;
  responsibleLawyer?: string;
  status: CaseStatus;
  lastUpdate: string;
  nextHearing?: string;
  description: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  activeCases: number;
}

export interface AIResponse {
  text: string;
  timestamp: Date;
  isUser: boolean;
}

export interface TJRSResult {
  id: string;
  number: string;
  parties: string;
  status: string;
  lastMovement: string;
  date: string;
  court: string;
}

export type ViewState = 'dashboard' | 'cases' | 'clients' | 'assistant' | 'documents' | 'tjrs';
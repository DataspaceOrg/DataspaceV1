import { request } from "./http";
export type UploadType =
  "csv" | "json" | "jsonl" | "sqlite" | "sql_dump" | "sql" | "db" | "unknown";

export type Dataset = {
  dataset_id: string;
  upload_type: UploadType;
  raw_byte_size: number;
  dataset_path: string;
  tables: string[];
  schema: Record<string, Record<string, string>>;
};

// Insight Session response formats from ai_routes.py

type InsightRequest = {
  table_name: string;
  dataset_context?: string;
};

type InsightResponse = {
  message: string;
  session: AgentSession;
  query: AgentQuery;
};

// Agent Sessions and Agent Query types which will be used to restore existing sessions.

export type AgentSession = {
  session_id: string;
  dataset_id: string;
  table_name: string;
  current_step: string;
  created_at: string;
  updated_at: string;
};

export type AgentQuery = {
  step_id: string;
  session_id: string;
  agent_step: string;
  prompt_input: string;
  response_output: string;
  created_at: string;
};

export type RestoreSessionResponse = {
  exists: boolean;
  session: AgentSession | null;
  queries: AgentQuery[];
};

export const fetchDatasets = () => request<Dataset[]>("/db/datasets");
export const fetchDatasetById = (id: string) =>
  request<Dataset>(`/db/datasets/${encodeURIComponent(id)}`);
export const restoreTableSession = (id: string, table: string) =>
  request<RestoreSessionResponse>(
    `/ai/dataset/${encodeURIComponent(id)}/session?${new URLSearchParams({ table_name: table })}`,
  );
export const queryInsightAgent = (id: string, body: InsightRequest) =>
  request<InsightResponse>(`/ai/dataset/${encodeURIComponent(id)}/insight`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

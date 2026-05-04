const API_BASE = 'http://localhost:8000';

/* Defined Constants for the API */
export type UploadType = "csv" | "json" | "jsonl" | "sqlite" | "sql_dump" | "sql" | "db" | "unknown";

export type Dataset = {
    dataset_id: string;
    upload_type: UploadType;
    raw_byte_size: number;
    dataset_path: string;
    tables: string[];
    schema: Record<string, Record<string, string>>;
}

// Insight Session response formats from ai_routes.py

type InsightRequest = {
    table_name: string;
    dataset_context?: string;
}

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
}

export type AgentQuery = {
    step_id: string;
    session_id: string;
    agent_step: string;
    prompt_input: string;
    response_output: string;
    created_at: string;
}

export type RestoreSessionResponse = {
    exists: boolean;
    session: AgentSession | null;
    queries: AgentQuery[];
}


export async function fetchDatasets(): Promise<Dataset[]> {

    // Currently ste to local backend. 
    const response = await fetch(`${API_BASE}/db/datasets`);

    if (!response.ok) {
        throw new Error(`Failed to fetch datasets: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
}

export async function fetchDatasetById(dataset_id: string): Promise<Dataset> {
    const response = await fetch(`${API_BASE}/db/datasets/${dataset_id}`);
    // const response = await fetch(`${API_BASE}/db/dataset/${encodeURIComponent(dataset_id)}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch dataset: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
}

export async function restoreTableSession(dataset_id: string, table_name: string): Promise<RestoreSessionResponse> {

    const params = new URLSearchParams({ table_name });
    const response = await fetch(`${API_BASE}/ai/dataset/${dataset_id}/session?${params.toString()}`);

    if (!response.ok) {
        throw new Error(`Failed to restore table session: ${response.statusText}`);
    }

    const session_data = await response.json();
    return session_data;
}

/* Insight Agent API Functions */

export async function queryInsightAgent(dataset_id: string, body: InsightRequest): Promise<InsightResponse> {
    const response = await fetch(`${API_BASE}/ai/dataset/${dataset_id}/insight`,
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(body),
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to run insight agent: ${response.statusText}`);
    }

    const data = await response.json()
    return data;
}
/* End of Insight Agent API Functions */
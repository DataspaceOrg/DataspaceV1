const API_BASE = 'http://localhost:8000';

export type UploadType = "csv" | "json" | "jsonl" | "sqlite" | "sql_dump" | "sql" | "db" | "unknown";

export type Dataset = {
    dataset_id: string;
    upload_type: UploadType;
    raw_byte_size: number;
    dataset_path: string;
    tables: string[];
    schema: Record<string, Record<string, string>>;
}

type InsightResponse = {
    message: string;
    insight_response: string;
};


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

export async function queryInsightAgent(dataset_id: string, table_name: string): Promise<InsightResponse> {
    const response = await fetch(`${API_BASE}/ai/dataset/${dataset_id}/insight?table_name=${table_name}`,
        {
            method: 'POST',
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to run insight agent: ${response.statusText}`);
    }

    const data = await response.json()
    return data;
}
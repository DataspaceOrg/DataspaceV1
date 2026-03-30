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
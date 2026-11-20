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

export function getUserId(): string {
    const userId = localStorage.getItem('dataspace_user_id');

    if (!userId) {
        throw new Error("User is not logged in.");
    }

    return userId;
}

export async function fetchDatasets(): Promise<Dataset[]> {

    // Currently ste to local backend. 
    const response = await fetch(`${API_BASE}/datasets`, {
        headers: {
            'x-user-id': getUserId(),
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch datasets: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
}

export async function fetchDatasetById(dataset_id: string): Promise<Dataset> {
    const response = await fetch(`${API_BASE}/datasets/${dataset_id}`, {
        headers: {
            'x-user-id': getUserId(),
        },
    });
    // const response = await fetch(`${API_BASE}/db/dataset/${encodeURIComponent(dataset_id)}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch dataset: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
}

export async function downloadDataset(dataset_id: string): Promise<Dataset> {
    const response = await fetch(`${API_BASE}/datasets/${dataset_id}/download`, {
        headers: {
            'x-user-id': getUserId(),
        },
    });
    // const response = await fetch(`${API_BASE}/db/dataset/${encodeURIComponent(dataset_id)}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch dataset: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
}

export async function deleteDataset(dataset_id: string): Promise<Dataset> {
    const response = await fetch(`${API_BASE}/datasets/${dataset_id}`, {
        method: "DELETE",
        headers: {
            'x-user-id': getUserId(),
        },
    });
    // const response = await fetch(`${API_BASE}/db/dataset/${encodeURIComponent(dataset_id)}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch dataset: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
}

export async function updateDataset(dataset_id: string, ): Promise<Dataset> {
    const response = await fetch(`${API_BASE}/datasets/${dataset_id}`, {
        method: 'PATCH',
        headers: {
            'x-user-id': getUserId(),
        },
        body: JSON.stringify({metadata: 'something'}),
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch dataset: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
}

export async function listDatasets(): Promise<Dataset> {
    const response = await fetch(`${API_BASE}/datasets`, {
        headers: {
            'x-user-id': getUserId()
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch dataset: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
}
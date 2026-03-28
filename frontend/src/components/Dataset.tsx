import { fetchDatasetById, type Dataset as DatasetModel } from '../shared/api';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

function Dataset() {

    const { dataset_id } = useParams<{ dataset_id: string }>();
    const [dataset, setDataset] = useState<DatasetModel | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {

        const id = dataset_id!; // dataset_id is a string, had null operator error here without !

        if (!id) {
            setError('Dataset ID is required');
            setLoading(false);
            return;
        }

        async function fetchData() {
            // If the component is unmounted (eg user navigates away from the page), we need to stop any components
            // from being updated. Cancelled eans when cleanup runs (i.e. when the component is unmounted). flip a switch to not call setSate
            let cancelled = false;

            try {
                const dataset = await fetchDatasetById(id); 
                if (!cancelled) {
                    setDataset(dataset);
                    setLoading(false);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'An unknown error occurred');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchData()
    }, [dataset_id]);

    return (    
        <div className="dashboard-container">
            <p><Link to="/dashboard">Dashboard</Link></p>
            <h1>Dataset {dataset?.dataset_id}</h1>
            <p>Upload Type: {dataset?.upload_type}</p>
            <p>Raw Byte Size: {dataset?.raw_byte_size}</p>
            <p>Dataset Path: {dataset?.dataset_path}</p>
            <p>Tables: {dataset?.tables.join(', ')}</p>
            <h2>Schema</h2>
            <pre>{JSON.stringify(dataset?.schema, null, 2)}</pre>
        </div>
    )
}

export default Dataset
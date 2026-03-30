import { useEffect, useState } from 'react';
import '../styles/Dashboard.css'
import { fetchDatasets, type Dataset } from '../shared/api';
import { Link } from 'react-router-dom';

function Dashboard() {
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        async function fetchData() {
            try {
                const datasets = await fetchDatasets(); 
                if (!cancelled) {
                    setDatasets(datasets);
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
        return () => {
            cancelled = true;
        }
    }, []);

    if (loading) return <div className="dashboard-container">Loading…</div>;
    if (error) return <div className="dashboard-container">Error: {error}</div>;

    return (
        <div className="dashboard-container">
            {/* Dashboard Goal - Display all of the datasets that are uploaded to the database. */}
            <h1 className="dashboard-title">Welcome to Dataspace Storage</h1>
            <p className="dashboard-description">Latest Datasets</p>
            <div className="dashboard-datasets">
                {datasets.length === 0 ? (<p>No Datasets Yet. Upload a New one to get Started!  </p>) : 
                <ul>
                    {datasets.map((dataset) => (
                        <li className="dashboard-dataset-item" key={dataset.dataset_id}>
                            <Link to={`/dataset/${dataset.dataset_id}`}>{dataset.dataset_id} — {dataset.upload_type} ({dataset.tables.length} table(s))</Link>
                        </li>
                    ))}
                </ul>
                }
            </div>
        </div>
    )
}

export default Dashboard;
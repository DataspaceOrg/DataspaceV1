import { useEffect, useState } from 'react';
import '../styles/Dashboard.css'
import { fetchDatasets, type Dataset } from '../shared/api';
import { Link } from 'react-router-dom';

function Dashboard() {
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            // If the component is unmounted (eg user navigates away from the page), we need to stop any components
            // from being updated. Cancelled eans when cleanup runs (i.e. when the component is unmounted). flip a switch to not call setSate
            let cancelled = false;

            try {
                const datasets = await fetchDatasets(); 
                if (!cancelled) {
                    setDatasets(datasets);
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
    }, []);

    // if (loading) {
    //     return <div>Loading...</div>;
    // }
    // if (error) {
    //     return <div>Error: {error}</div>;
    // }

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
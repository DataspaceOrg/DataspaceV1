import { fetchDatasetById, type Dataset as DatasetModel } from '../shared/api';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/Dataset.css';

function Dataset() {
    const { dataset_id } = useParams<{ dataset_id: string }>();
    const [dataset, setDataset] = useState<DatasetModel | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [insightMessage, setInsightMessage] = useState<string | null>(null);


    useEffect(() => {
        const id = dataset_id;
        if (!id) {
            setError('Dataset ID is required');
            setLoading(false);
            return;
        }

        let cancelled = false;

        async function fetchData(datasetId: string) {
            try {
                const dataset = await fetchDatasetById(datasetId);
                if (!cancelled) {
                    setDataset(dataset);
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

        fetchData(id)
        return () => {
            cancelled = true;
        }
    }, [dataset_id]);

    if (loading) return <div className="dataset-page">Loading…</div>;
    if (error) return <div className="dataset-page">Error: {error}</div>;

    const handleInsightClick = () => {
        setInsightMessage('Insight agent UI added. API integration is the next step.');
    };

    return (    
        <div className="dataset-page">
            <header className="dataset-hero">
                <div className="dataset-breadcrumbs">
                    <Link to="/dashboard">Datasets</Link>
                    <span>/</span>
                    <span className="dataset-code-text">{dataset?.dataset_id?.slice(0, 8)}…</span>
                </div>

                <div className="dataset-hero-top">
                    <div className="dataset-title-group">
                        <p className="dataset-eyebrow">Dataset Details</p>
                        <h1 className="dataset-title">{dataset?.dataset_id}</h1>
                        <p className="dataset-subtitle">
                            Review the uploaded dataset, inspect its tables, and launch agent workflows.
                        </p>
                    </div>

                    <div className="dataset-actions">
                        <button className="dataset-button dataset-button-secondary" onClick={() => window.location.reload()}>
                            Refresh Dataset
                        </button>
                        <button className="dataset-button dataset-button-primary" onClick={handleInsightClick}>
                            Run Insight Agent
                        </button>
                    </div>
                </div>

                <div className="dataset-summary-grid">
                    <section className="dataset-summary-card">
                        <p className="dataset-summary-label">Upload Type</p>
                        <p className="dataset-summary-value">{dataset?.upload_type}</p>
                    </section>

                    <section className="dataset-summary-card">
                        <p className="dataset-summary-label">Raw File Size</p>
                        <p className="dataset-summary-value">{dataset?.raw_byte_size} bytes</p>
                    </section>

                    <section className="dataset-summary-card">
                        <p className="dataset-summary-label">Table Count</p>
                        <p className="dataset-summary-value">{dataset?.tables?.length ?? 0}</p>
                    </section>

                    <section className="dataset-summary-card">
                        <p className="dataset-summary-label">Dataset Path</p>
                        <p className="dataset-summary-value dataset-code-text">{dataset?.dataset_path}</p>
                    </section>
                </div>

                {insightMessage && <p className="dataset-status-banner">{insightMessage}</p>}
            </header>

            <main className="dataset-layout-grid">
                <section className="dataset-panel">
                    <div className="dataset-panel-header">
                        <div>
                            <p className="dataset-panel-kicker">Overview</p>
                            <h2 className="dataset-panel-title">Dataset Information</h2>
                        </div>
                    </div>

                    <div className="dataset-detail-list">
                        <div className="dataset-detail-row">
                            <p className="dataset-detail-label">Dataset ID</p>
                            <p className="dataset-detail-value dataset-code-text">{dataset?.dataset_id}</p>
                        </div>

                        <div className="dataset-detail-row">
                            <p className="dataset-detail-label">Storage Path</p>
                            <p className="dataset-detail-value dataset-code-text">{dataset?.dataset_path}</p>
                        </div>

                        <div className="dataset-detail-row">
                            <p className="dataset-detail-label">Upload Type</p>
                            <p className="dataset-detail-value">{dataset?.upload_type}</p>
                        </div>

                        <div className="dataset-detail-row">
                            <p className="dataset-detail-label">Raw Byte Size</p>
                            <p className="dataset-detail-value">{dataset?.raw_byte_size} bytes</p>
                        </div>
                    </div>
                </section>

                <section className="dataset-panel">
                    <div className="dataset-panel-header">
                        <div>
                            <p className="dataset-panel-kicker">Tables</p>
                            <h2 className="dataset-panel-title">Available Tables</h2>
                        </div>
                    </div>

                    <div className="dataset-table-list">
                        {(dataset?.tables ?? []).map((t) => (
                            <div key={t} className="dataset-table-item">
                                <div>
                                    <p className="dataset-table-name dataset-code-text">{t}</p>
                                    <p className="dataset-table-description">Ready for exploration and downstream agent analysis.</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="dataset-panel dataset-panel-full">
                    <div className="dataset-panel-header">
                        <div>
                            <p className="dataset-panel-kicker">Schema</p>
                            <h2 className="dataset-panel-title">Dataset Schema</h2>
                        </div>
                    </div>

                    <pre className="dataset-schema-block">{JSON.stringify(dataset?.schema ?? {}, null, 2)}</pre>
                </section>
            </main>
        </div>
    )
}

export default Dataset
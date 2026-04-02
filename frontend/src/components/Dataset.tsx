import { fetchDatasetById, type Dataset as DatasetModel, queryInsightAgent } from '../shared/api';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/Dataset.css';

function Dataset() {
    const { dataset_id } = useParams<{ dataset_id: string }>();
    const [dataset, setDataset] = useState<DatasetModel | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [insightMessage, setInsightMessage] = useState<string | null>(null);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);


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
                    // Set the first table as the selected table by default.
                    setSelectedTable(dataset.tables[0] ?? null);
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

    const handleInsightClick = async () => {
        /* 
        handleInsightClick is a function that is used to run the insight agent for the selected table. 
        It will call the API to run the insight agent and update the state with the result.
        */

        // If there is no table selected then set the insight message to ask for a table to be selected. 
        if (!selectedTable) {
            setInsightMessage('Select a table before running the insight agent.');
            return;
        }

        if (!dataset_id) {
            setError('Dataset ID is required');
            return;
        }

        try {
            const response = await queryInsightAgent(dataset_id, selectedTable);
            setInsightMessage(response.insight_response);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        }


    };

    // Set the schema of the selected table. dataset?.schema?.[selectedTable] checks if there is an existing schema, if its null then return null. 
    const selectedTableSchema = selectedTable ? dataset?.schema?.[selectedTable] ?? null : null;

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
                        <p className="dataset-name">Dataset Details</p>
                    </div>

                    <div className="dataset-actions">
                        {/* Refresh the dataset page. */}
                        <button className="dataset-button dataset-button-secondary" onClick={() => window.location.reload()}>
                            Refresh Dataset
                        </button>
                    </div>
                </div>

                <div className="dataset-summary-grid">
                     <section className="dataset-summary-card">
                        <p className="dataset-summary-label">Dataset Name</p>
                        <p className="dataset-summary-value dataset-code-text">[Placeholder Name]</p>
                    </section>
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
                        {/* If dataset is null, return 0 for size. */}
                        <p className="dataset-summary-value">{dataset?.tables?.length ?? 0}</p>
                    </section>

                    {/* <section className="dataset-summary-card">
                        <p className="dataset-summary-label">Dataset Path</p>
                        <p className="dataset-summary-value dataset-code-text">{dataset?.dataset_path}</p>
                    </section> */}
                </div>
            </header>

            <section className="dataset-panel dataset-panel-full">
                <section className="dataset-panel dataset-panel-full">
                    <div className="dataset-panel-header">
                        <div>
                            <p className="dataset-panel-kicker">Schema</p>
                            <h2 className="dataset-panel-title">
                                {selectedTable ? `${selectedTable} Schema` : 'Dataset Schema'}
                            </h2>
                        </div>
                    </div>

                    <pre className="dataset-schema-block">
                        {JSON.stringify(selectedTableSchema ?? dataset?.schema ?? {}, null, 2)}
                    </pre>
                </section>

                <div className="dataset-panel-header">
                    <div>
                        <p className="dataset-panel-kicker">Tables</p>
                        <h2 className="dataset-panel-title">Choose a table to explore</h2>
                    </div>
                </div>

                <div className="dataset-table-tabs">
                    {/* Loop through all the tables in the total dataset and then map them to tab elements.  */}
                    {(dataset?.tables ?? []).map((tableName) => (
                        <button
                            key={tableName}
                            type="button"
                            className={
                                // If the table name is the same as the selected table then set the class to the active tab.
                                tableName === selectedTable
                                    ? 'dataset-table-tab dataset-table-tab-active'
                                    : 'dataset-table-tab'
                            }
                            // On the click set the selected table to the table name from the dataset.tables array.
                            onClick={() => setSelectedTable(tableName)}
                        >
                            {/* Display the table name. */}
                            <span className="dataset-table-tab-name dataset-code-text">{tableName}</span>
                            <span className="dataset-table-tab-meta">
                                {tableName === selectedTable ? 'Active table' : 'Open workspace'}
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            <main className="dataset-layout-grid">
                <section className="dataset-panel">
                    {/* Table Tabs */}
                    <div className="dataset-panel-header">
                        <div>
                            <p className="dataset-panel-kicker">Workspace</p>
                            <h2 className="dataset-panel-title">
                                {selectedTable ? `Table Workspace: ${selectedTable}` : 'Select a table'}
                            </h2>
                        </div>
                    </div>

                    <div className="dataset-workspace-panel">
                        <div className="dataset-workspace-current-table">
                            <p className="dataset-workspace-label">Current table</p>
                            <p className="dataset-workspace-value dataset-code-text">
                                {selectedTable ?? 'No table selected'}
                            </p>
                        </div>

                        <div className="dataset-workflow-steps">
                            <div key={1} className="dataset-workflow-step">
                                <div>
                                    <span className="dataset-workflow-step-number">1</span>
                                    <span className="dataset-workflow-step-label">Prompt step: Insight Agent</span>
                                </div>
                                <p>The insight agent will be used to get a quick overview of the data on the current selected table: {selectedTable}</p>

                                {/* Run the insight agent. */}
                                <div className="dataset-workflow-step-button">
                                <p>{insightMessage}</p>
                                <button className="dataset-button dataset-button-primary" onClick={handleInsightClick}>
                                Run Insight Agent
                                </button>
                                </div>
                            </div>

                            {/* {[1, 2, 3, 4, 5].map((step) => (
                                <div key={step} className="dataset-workflow-step">
                                    <span className="dataset-workflow-step-number">{step}</span>
                                    <span className="dataset-workflow-step-label">Prompt step {step}</span>
                                </div>
                            ))} */}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}

export default Dataset
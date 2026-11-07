import { fetchDatasetById, type Dataset as DatasetModel, queryInsightAgent, restoreTableSession } from '../shared/api';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/Dataset.css';

import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
} from "ag-grid-community";

// module registration for ag grid
ModuleRegistry.registerModules([AllCommunityModule]);

const datasetGridTheme = themeQuartz.withParams({
    backgroundColor: '#ffffff',
    foregroundColor: '#102647',
    headerBackgroundColor: '#f4f8ff',
    headerTextColor: '#102647',
    borderColor: '#dde6f2',
    accentColor: '#205dcc',
    fontFamily: 'inherit',
});

function Dataset() {
    const { dataset_id } = useParams<{ dataset_id: string }>();
    const [dataset, setDataset] = useState<DatasetModel | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [insightMessage, setInsightMessage] = useState<string | null>(null);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [datasetContext, setDatasetContext] = useState('');

    type DatasetRow = Record<string, string | number | boolean | null>;
    const [rowData, setRowData] = useState<DatasetRow[]>([]);

    type RowsResponse = {
        rows: DatasetRow[];
        total_rows: number;
        num_rows: number;
        offset: number;
    };

    const [page, setPage] = useState(0);
    const [totalRows, setTotalRows] = useState(0);
    const [rowsLoading, setRowsLoading] = useState(false);
    const [rowsError, setRowsError] = useState<string | null>(null);

    const pageSize = 100;

    // const [session, setSession] = useState<AgentSession | null>(null);
    // const [queries, setQueries] = useState<AgentQuery[]>([]);

    // Use effect for fetching information about the dataset.
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
                    // set first page as offset 0 by default
                    setPage(0);
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

    useEffect(() => {
        // If the dataset id or selected table is not set, then no operation can be performed.
        if (!dataset_id || !selectedTable) return;

        let cancelled = false;

        async function restoreSession(datasetId: string, tableName: string) {

            // Returns a response with the RestoreSessionResponse promise. 
            const sessionResponse = await restoreTableSession(datasetId, tableName)

            if (cancelled) return;

            if (!sessionResponse.exists) {
                // setSession(null);
                // setQueries([]);
                setInsightMessage(null);
                return;
            }

            // Logging the session. 
            console.log(sessionResponse);

            // Append the existing session and queries to the state. 
            // setSession(sessionResponse.session);
            // setQueries(sessionResponse.queries);

            // Retrieve the latest insight query from the session. (Currently there should only be 1 or 0 insight queries per existing session.)
            // We take a copu of the sessionResponse.queries and reverse it to get the latest insight query.
            const latestInsight = [...sessionResponse.queries].reverse().find((query) => query.agent_step === 'insight');

            setInsightMessage(latestInsight?.response_output ?? null);
        }

        restoreSession(dataset_id, selectedTable).catch((err) => {
            if (!cancelled) {
                setAnalysisError(err instanceof Error ? err.message : 'Failed to restore insights.');
            }
        });
        // Cleanup function for when the component is unmounted (i.e if the user navigates away from the dataset page).
        return () => {
            cancelled = true;
        }
    }, [dataset_id, selectedTable]);


    const isCsv = dataset?.upload_type === 'csv';
    const supportsPreview = isCsv || dataset?.upload_type === 'db' || dataset?.upload_type === 'sqlite';

    // Fetch a CSV page or a sample from the selected SQLite table.
    useEffect(() => {
        if (!dataset_id || !selectedTable ||
            dataset?.dataset_id !== dataset_id || !supportsPreview) return;

        const controller = new AbortController();
        const tableName = selectedTable;

        async function loadRows() {
            setRowsLoading(true);
            setRowsError(null);
            setRowData([]);

            const params = new URLSearchParams({
                table_name: tableName,
                num_rows: String(pageSize),
                offset: String(page * pageSize),
            });

            try {
                const response = await fetch(
                    `http://localhost:8000/db/datasets/${dataset_id}/rows?${params}`,
                    {
                        headers: {
                            "x-user-id": localStorage.getItem("dataspace_user_id") ?? "",
                        },
                        signal: controller.signal,
                    }
                );

                if (!response.ok) throw new Error("Failed to load rows.");

                const data: RowsResponse = await response.json();
                if (controller.signal.aborted) return;

                setRowData(data.rows);
                setTotalRows(data.total_rows);
            } catch (error) {
                if (!controller.signal.aborted) {
                    setRowsError(error instanceof Error ? error.message : "Failed to load rows.");
                }
            } finally {
                if (!controller.signal.aborted) setRowsLoading(false);
            }
        }

        loadRows();
        return () => controller.abort();
    }, [dataset_id, selectedTable, dataset?.dataset_id, supportsPreview, page, pageSize]);

    const handleInsightClick = async () => {
        // If there is no table selected then set the insight message to ask for a table to be selected. 
        if (!selectedTable) {
            setInsightMessage('Select a table before running the insight agent.');
            return;
        }

        if (!dataset_id) {
            setError('Dataset ID is required');
            return;
        }

        setAnalysisError(null);
        try {
            const response = await queryInsightAgent(dataset_id, { table_name: selectedTable, dataset_context: datasetContext, });
            setInsightMessage(response.query.response_output);
        } catch (err) {
            setAnalysisError(err instanceof Error ? err.message : 'An unknown error occurred');
        }
    };
    // Set the schema of the selected table. dataset?.schema?.[selectedTable] checks if there is an existing schema, if its null then return null. 
    const selectedTableSchema = selectedTable ? dataset?.schema?.[selectedTable] ?? null : null;

    // get column definitions of current .csv file for ag-grid
    const columnDefs = Object.keys(selectedTableSchema ?? {}).map(
        (columnName) => ({
            field: columnName,
            headerName: columnName,
        })
    );

    /* 
    flow for getting data for ag-grid
    metadata schema -> columnDefs
    stored Parquet -> backend rows endpoint -> rowData
    */
    

    return (
        <div className="dataset-page">
            <header className="dataset-header">
                <Link className="dataset-back-link" to="/dashboard">← Datasets</Link>
                <div className="dataset-header-top">
                    <div>
                        <h1>Dataset details</h1>
                        <p className="dataset-id">{dataset_id}</p>
                    </div>
                    <button
                        type="button"
                        className="dataset-button"
                        onClick={() => window.location.reload()}
                    >
                        Refresh Dataset
                    </button>
                </div>
                {dataset && !loading && !error && (
                    <dl className="dataset-meta">
                        <div><dt>Upload type</dt><dd>{dataset.upload_type}</dd></div>
                        <div><dt>File size</dt><dd>{dataset.raw_byte_size.toLocaleString()} bytes</dd></div>
                        <div><dt>Tables</dt><dd>{dataset.tables.length}</dd></div>
                    </dl>
                )}
            </header>

            {loading && <p role="status">Loading dataset…</p>}
            {error && <p role="alert">Error: {error}</p>}
            {!loading && !error && dataset && (
                <>
                    <section className="dataset-section" aria-labelledby="dataset-tables-title">
                        <h2 id="dataset-tables-title">Tables</h2>
                        {selectedTable === null ? (
                            <p>No tables available.</p>
                        ) : (
                            <>
                                <label htmlFor="dataset-table-select">Table</label>
                                <select
                                    id="dataset-table-select"
                                    className="dataset-table-select"
                                    value={selectedTable}
                                    onChange={(event) => {
                                        setSelectedTable(event.target.value);
                                        setPage(0);
                                        setInsightMessage(null);
                                        setAnalysisError(null);
                                    }}
                                >
                                    {dataset.tables.map((tableName) => (
                                        <option key={tableName} value={tableName}>{tableName}</option>
                                    ))}
                                </select>
                                {supportsPreview && (
                                    <>
                                        <div className="dataset-ag-grid" aria-busy={rowsLoading}>
                                            <AgGridReact
                                                theme={datasetGridTheme}
                                                suppressFieldDotNotation
                                                loading={rowsLoading}
                                                rowData={rowData}
                                                columnDefs={columnDefs}
                                            />
                                        </div>
                                        {rowsError && <p role="alert">{rowsError}</p>}
                                        {isCsv ? (
                                            <div className="dataset-pagination">
                                                <button
                                                    type="button"
                                                    className="dataset-button"
                                                    disabled={page === 0 || rowsLoading}
                                                    onClick={() => setPage((current) => current - 1)}
                                                >
                                                    Previous
                                                </button>
                                                <span aria-live="polite">
                                                    {rowsLoading ? "Loading rows…" :
                                                        rowsError ? "Rows unavailable" : `Page ${page + 1} of ${Math.max(1, Math.ceil(totalRows / pageSize))} · ${totalRows} rows`}
                                                </span>
                                                <button
                                                    type="button"
                                                    className="dataset-button"
                                                    disabled={rowsLoading || rowsError !== null || (page + 1) * pageSize >= totalRows}
                                                    onClick={() => setPage((current) => current + 1)}
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        ) : !rowsLoading && !rowsError && (
                                            <p className="dataset-pagination" aria-live="polite">
                                                {totalRows} sample rows
                                            </p>
                                        )}
                                    </>
                                )}
                                <details key={dataset.dataset_id} className="dataset-schema" open={!isCsv}>
                                    <summary>Schema</summary>
                                    <pre>{JSON.stringify(selectedTableSchema ?? {}, null, 2)}</pre>
                                </details>
                            </>
                        )}
                    </section>

                    {selectedTable !== null && (
                        <section className="dataset-section" aria-labelledby="dataset-analysis-title">
                            <h2 id="dataset-analysis-title">Analysis</h2>
                            <label htmlFor="dataset-context-input">Additional information</label>
                            <textarea
                                className="dataset-input-textarea"
                                id="dataset-context-input"
                                value={datasetContext}
                                onChange={(event) => setDatasetContext(event.target.value)}
                            />
                            <button
                                type="button"
                                className="dataset-button dataset-button-primary"
                                onClick={handleInsightClick}
                            >
                                Run Insight Agent
                            </button>
                            {analysisError && <p role="alert">{analysisError}</p>}
                            {insightMessage && (
                                <>
                                    <pre className="dataset-insight-output">{insightMessage}</pre>
                                    <button
                                        type="button"
                                        className="dataset-button"
                                        onClick={handleInsightClick}
                                    >
                                        Run Aggregation Creator
                                    </button>
                                </>
                            )}
                        </section>
                    )}
                </>
            )}
        </div>
    );
}

export default Dataset;

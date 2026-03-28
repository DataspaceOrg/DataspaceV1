import { useEffect, useState } from 'react';
import '../styles/Dashboard.css'

function Dashboard() {

    return (
        <div className="dashboard-container">
            {/* Dashboard Goal - Display all of the datasets that are uploaded to the database. */}
            <h1 className="dashboard-title">Welcome to Dataspace Storage</h1>
            <p className="dashboard-description">Latest Datasets</p>
            <div className="dashboard-datasets"></div>
        </div>
    )
}

export default Dashboard;
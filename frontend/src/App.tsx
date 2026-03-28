import { Routes, Route } from 'react-router-dom'
import './styles/App.css'
import Sidebar from './components/Sidebar'
import Upload from './components/Upload'
import Dataset from './components/Dataset'
import Dashboard from './components/Dashboard'


function App() {
  return (
    <div className="app-container">
      {/* Side bar will be accessible from all pages. */}
      <Sidebar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<p>Welcome to Dataspace</p>} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dataset/:dataset_id/" element={<Dataset />} />
          <Route path="/upload" element={<Upload />} />
        </Routes>
      </div>
    </div>
  )
}

// npm run dev

export default App

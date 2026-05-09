import { Routes, Route, useLocation } from 'react-router-dom'
import './styles/App.css'
import Sidebar from './components/Sidebar'
import Upload from './components/Upload'
import Dataset from './components/Dataset'
import Dashboard from './components/Dashboard'
import AuthPage from './components/AuthPage'



function App() {

  const location = useLocation();

  const isAuthPage = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup';


  return (
    <div className="app-container">
      {/* Side bar will be accessible from all pages. */}
      {!isAuthPage && <Sidebar />}
    
      <div className={isAuthPage ? 'hero-content' : 'main-content'}>
        <Routes>
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          {/* <Route path="/" element={<p>Welcome to Dataspace</p>} /> */}
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

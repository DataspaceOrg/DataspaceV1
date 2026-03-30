import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FiGrid, FiUpload, FiSettings, FiChevronLeft } from 'react-icons/fi'
import dataspaceImage from '../images/Dataspace.png'
import '../styles/Sidebar.css'

function Sidebar() {

  // State for active menu
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  // State for collapsing the sidebar
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Function to toggle the sidebar
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>

      {/* Dataspace Logo which when clicked, goes to the home page. */}
      <div className="sidebar-header">
        <NavLink to="/" className="sidebar-logo-link">
          <img src={dataspaceImage} alt="Dataspace" className="sidebar-logo" />
        </NavLink>
        <button className="collapse-button" onClick={toggleSidebar} title={isCollapsed ? 'Expand' : 'Collapse'} >
          <FiChevronLeft className="collapse-icon" style={{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }} />
        </button>
      </div>

      <nav className="sidebar-nav">

        {/* Dashboard - navigates to dashboard page */}
        <NavLink to="/dashboard" className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`} title="Dashboard">
          <FiGrid className="sidebar-icon" />
          <span className="sidebar-label">Dashboard</span>
        </NavLink>

        {/* Upload - navigates to upload page */}
        <NavLink to="/upload" className={({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`} title="Upload Files">
          <FiUpload className="sidebar-icon" />
          <span className="sidebar-label">Upload</span>
        </NavLink>

        {/* Settings Button */}
        <button
          className={`sidebar-button ${activeMenu === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveMenu(activeMenu === 'settings' ? null : 'settings')}
          title="Settings"
        >
          <FiSettings className="sidebar-icon" />
          <span className="sidebar-label">Settings</span>
        </button>
        
      </nav>
    </div>
  )
}

export default Sidebar

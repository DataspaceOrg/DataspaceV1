import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { FiGrid, FiUpload, FiLogOut } from "react-icons/fi";
import { clearWorkspace, workspaceNavigation } from "../shared/workspace";
export default function Sidebar() {
  const navigate = useNavigate();
  const inDataset = useLocation().pathname.startsWith("/dataset/");
  function logout() {
    clearWorkspace();
    ["dataspace_user_id", "dataspace_username", "dataspace_email"].forEach(
      (key) => localStorage.removeItem(key),
    );
    navigate("/", { replace: true });
  }
  return (
    <aside className="sidebar">
      <Link className="brand" to="/dashboard">
        dataspace
      </Link>
      <nav aria-label="Workspace">
        <NavLink
          to={workspaceNavigation.library}
          aria-current={inDataset ? "page" : undefined}
          className={({ isActive }) =>
            isActive || inDataset ? "nav-link active" : "nav-link"
          }
        >
          <FiGrid aria-hidden="true" />
          Datasets
        </NavLink>
        <NavLink
          to="/upload"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          <FiUpload aria-hidden="true" />
          Upload
        </NavLink>
      </nav>
      <div className="account">
        <span className="muted small account-name">
          {localStorage.getItem("dataspace_username")}
        </span>
        <button className="nav-link" onClick={logout}>
          <FiLogOut aria-hidden="true" />
          Log out
        </button>
      </div>
    </aside>
  );
}

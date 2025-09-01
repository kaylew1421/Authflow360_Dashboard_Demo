import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-100 border-r p-4">
      <ul className="space-y-2">
        <li>
          <NavLink to="/" className={({ isActive }) =>
            `block px-4 py-2 rounded hover:bg-gray-200 ${
              isActive ? "bg-gray-300 font-semibold" : ""
            }`
          }>
            🏠 Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/authorizations" className={({ isActive }) =>
            `block px-4 py-2 rounded hover:bg-gray-200 ${
              isActive ? "bg-gray-300 font-semibold" : ""
            }`
          }>
            📑 Authorizations
          </NavLink>
        </li>
        <li>
          <NavLink to="/search" className={({ isActive }) =>
            `block px-4 py-2 rounded hover:bg-gray-200 ${
              isActive ? "bg-gray-300 font-semibold" : ""
            }`
          }>
            🔎 Search & Status
          </NavLink>
        </li>
        <li>
          <NavLink to="/clients" className={({ isActive }) =>
            `block px-4 py-2 rounded hover:bg-gray-200 ${
              isActive ? "bg-gray-300 font-semibold" : ""
            }`
          }>
            👥 Clients / Clinics
          </NavLink>
        </li>
        <li>
          <NavLink to="/compliance" className={({ isActive }) =>
            `block px-4 py-2 rounded hover:bg-gray-200 ${
              isActive ? "bg-gray-300 font-semibold" : ""
            }`
          }>
            🛡 Compliance / Logs
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin" className={({ isActive }) =>
            `block px-4 py-2 rounded hover:bg-gray-200 ${
              isActive ? "bg-gray-300 font-semibold" : ""
            }`
          }>
            👨‍💼 Admin
          </NavLink>
        </li>
        <li>
          <NavLink to="/settings" className={({ isActive }) =>
            `block px-4 py-2 rounded hover:bg-gray-200 ${
              isActive ? "bg-gray-300 font-semibold" : ""
            }`
          }>
            ⚙️ Settings
          </NavLink>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;

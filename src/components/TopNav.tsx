import { Bell, User, Settings, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const TopNav = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { logout } = useAuth();

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b relative">
      {/* Left: Logo or App Name */}
      <Link to="/" className="text-xl font-bold text-indigo-600 hover:text-indigo-800">
        AuthFlow360
      </Link>

      {/* Center: (Optional) Search Bar */}
      <div className="hidden md:flex items-center bg-gray-100 px-3 py-1 rounded w-1/3">
        <Search className="text-gray-400 mr-2" size={18} />
        <input
          type="text"
          placeholder="Search authorizations, clients, users..."
          className="bg-transparent outline-none w-full text-sm text-gray-700"
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-4">
        <button className="text-gray-600 hover:text-indigo-600" title="Notifications">
          <Bell size={20} />
        </button>

        <Link to="/settings" className="text-gray-600 hover:text-indigo-600" title="Settings">
          <Settings size={20} />
        </Link>

        <div className="relative">
          <button
            className="text-gray-600 hover:text-indigo-600"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            title="User Menu"
          >
            <User size={20} />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-md z-50">
              <Link
                to="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setUserMenuOpen(false)}
              >
                My Profile
              </Link>
              <Link
                to="/settings"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setUserMenuOpen(false)}
              >
                Account Settings
              </Link>
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setUserMenuOpen(false);
                  logout();
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;

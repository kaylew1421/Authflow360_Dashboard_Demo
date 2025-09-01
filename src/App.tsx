import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Components
import Sidebar from "./components/Sidebar";
import TopNav from "./components/TopNav";

// Pages
import Home from "./pages/Home";
import Authorizations from "./pages/Authorizations";
import Search from "./pages/Search";
import Clients from "./pages/Clients";
import Compliance from "./pages/Compliance";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import Login from "./pages/Login";

const App = () => {
  const { user } = useAuth();

  if (!user) {
    return <Routes><Route path="*" element={<Login />} /></Routes>;
  }

  return (
    <div className="flex flex-col h-screen">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 px-8 py-6 overflow-y-auto bg-white">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/authorizations" element={<Authorizations />} />
            <Route path="/search" element={<Search />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<Navigate to="/" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;

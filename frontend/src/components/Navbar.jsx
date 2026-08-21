import { Link, NavLink, useNavigate } from "react-router-dom";
import { BarChart3, Database, Upload, LogOut } from "lucide-react";
import toast from "react-hot-toast";

function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.success("Logged out successfully");

    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-indigo-50 text-indigo-600"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* LOGO */}

        <Link
          to="/dashboard"
          className="flex items-center gap-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <BarChart3 size={20} />
          </div>

          <div>
            <h1 className="text-base font-bold text-slate-900">
              Order Analytics
            </h1>

            <p className="hidden text-[10px] text-slate-400 sm:block">
              Data intelligence platform
            </p>
          </div>
        </Link>

        {/* NAVIGATION */}

        <nav className="hidden items-center gap-1 md:flex">

          <NavLink
            to="/dashboard"
            className={linkClass}
          >
            <BarChart3 size={16} />
            Dashboard
          </NavLink>

          <NavLink
            to="/upload"
            className={linkClass}
          >
            <Upload size={16} />
            Upload
          </NavLink>

          <NavLink
            to="/preview"
            className={linkClass}
          >
            <Database size={16} />
            Preview
          </NavLink>

          <NavLink
            to="/analytics"
            className={linkClass}
          >
            <BarChart3 size={16} />
            Analytics
          </NavLink>

        </nav>

        {/* LOGOUT */}

        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={16} />

          <span className="hidden sm:inline">
            Logout
          </span>
        </button>

      </div>
    </header>
  );
}

export default Navbar;
import {
  FiGrid,
  FiUpload,
  FiBarChart2,
  FiUsers,
  FiShoppingCart,
  FiClock,
  FiLogOut,
} from "react-icons/fi";

import { NavLink, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <FiGrid />,
    },
    {
      name: "Upload Data",
      path: "/upload",
      icon: <FiUpload />,
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: <FiBarChart2 />,
    },
    {
      name: "Users",
      path: "/users",
      icon: <FiUsers />,
    },
   
    {
      name: "History",
      path: "/history",
      icon: <FiClock />,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <aside className="sidebar">

      {/* Logo */}
      <div className="sidebar-logo">
        <h2>Order<span>ly</span></h2>
      </div>


      {/* User */}
      <div className="sidebar-user">
        <div className="user-avatar">
          👤
        </div>

        <div>
          <h4>User</h4>
          <p>Analytics</p>
        </div>
      </div>


      {/* Navigation */}
      <nav className="sidebar-nav">

        {menuItems.map((item) => (

          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >

            <span className="sidebar-icon">
              {item.icon}
            </span>

            <span>
              {item.name}
            </span>

          </NavLink>

        ))}

      </nav>


      {/* Logout */}
      <button
        className="logout-btn"
        onClick={handleLogout}
      >
        <FiLogOut />

        <span>
          Logout
        </span>
      </button>

    </aside>
  );
};

export default Sidebar;
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import UploadData from "./pages/UploadData";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Users from "./pages/Users";
import History from "./pages/History";
import NotFound from "./pages/NotFound";

import Layout from "./components/Layout";


function ProtectedRoute({ children }) {

  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


function App() {

  return (
    <Routes>

      {/* =========================
          PUBLIC
      ========================= */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />


      {/* =========================
          DASHBOARD
      ========================= */}

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />


      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />


      {/* =========================
          UPLOAD
      ========================= */}

      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <Layout>
              <UploadData />
            </Layout>
          </ProtectedRoute>
        }
      />


      {/* =========================
          ANALYTICS
      ========================= */}

      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Layout>
              <Analytics />
            </Layout>
          </ProtectedRoute>
        }
      />


      {/* =========================
          USERS
      ========================= */}

      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Layout>
              <Users />
            </Layout>
          </ProtectedRoute>
        }
      />


   

      {/* =========================
          HISTORY
      ========================= */}

      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <Layout>
              <History />
            </Layout>
          </ProtectedRoute>
        }
      />


      {/* =========================
          NOT FOUND
      ========================= */}

      <Route
        path="*"
        element={<NotFound />}
      />

    </Routes>
  );
}


export default App;
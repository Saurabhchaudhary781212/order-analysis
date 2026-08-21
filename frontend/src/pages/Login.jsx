import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      console.log("Sending login request...");

      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      console.log("LOGIN RESPONSE:", response.data);

      const data = response.data;

      // Accept common token names
      const token =
        data.token ||
        data.access_token ||
        data.accessToken;

      if (!token) {
        console.error(
          "No token returned from backend:",
          data
        );

        toast.error(
          data.message ||
          "Login failed: token was not returned"
        );

        return;
      }

      // Save authentication
      localStorage.setItem("token", token);

      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      }

      toast.success("Login successful!");

      // Go to dashboard
      navigate("/dashboard", {
        replace: true,
      });

    } catch (error) {

      console.error(
        "LOGIN ERROR:",
        error
      );

      console.error(
        "SERVER RESPONSE:",
        error.response?.data
      );

      toast.error(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Invalid email or password"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">

      <div className="w-full max-w-md">

        <div className="mb-8 text-center">

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-2xl">
            📊
          </div>

          <h1 className="text-3xl font-bold text-white">
            Order Analytics
          </h1>

          <p className="mt-2 text-slate-400">
            Sign in to your account
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
        >

          <div className="space-y-5">

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your email"
                autoComplete="email"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-indigo-500"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-indigo-500"
              />

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Signing in..."
                : "Sign In"}
            </button>

          </div>

          <p className="mt-6 text-center text-sm text-slate-500">

            Don't have an account?{" "}

            <Link
              to="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Create account
            </Link>

          </p>

        </form>

      </div>

    </div>
  );
}

export default Login;
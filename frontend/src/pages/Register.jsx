import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import toast from "react-hot-toast";

import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (
      !name ||
      !email ||
      !password
    ) {
      toast.error(
        "Please fill all fields"
      );
      return;
    }

    try {

      setLoading(true);

      await api.post(
        "/auth/register",
        {
          name,
          email,
          password,
        }
      );

      toast.success(
        "Account created successfully!"
      );

      navigate("/login");

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Registration failed"
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-5 py-10">

      <div className="w-full max-w-md">

        <div className="mb-8 text-center">

          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-xl text-white">
            📊
          </div>

          <h1 className="text-3xl font-bold text-white">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Start analyzing your data today.
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8"
        >

          <div className="space-y-5">

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Full Name
              </label>

              <input
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                placeholder="Enter Your Name"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                placeholder="Create password"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              />

            </div>

            <button
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading
                ? "Creating..."
                : "Create Account"}
            </button>

          </div>

          <p className="mt-6 text-center text-sm text-slate-500">

            Already have an account?{" "}

            <Link
              to="/login"
              className="font-semibold text-indigo-600"
            >
              Sign in
            </Link>

          </p>

        </form>

      </div>

    </div>
  );
}

export default Register;
import { useEffect, useState } from "react";
import {
  FiUsers,
  FiMail,
  FiShield,
  FiCheckCircle,
  FiUser
} from "react-icons/fi";

function User() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Invalid user data:", error);
      }
    }
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold text-slate-900">
            My Account
          </h1>

          <p className="mt-2 text-slate-500">
            No user information found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">
          My Account
        </h1>

        <p className="mt-2 text-lg text-slate-500">
          View your account information.
        </p>
      </div>

      {/* Account Card */}
      <div className="mx-auto max-w-6xl rounded-3xl bg-white p-10 shadow-sm">

        {/* Icon */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-100">
          <FiUsers className="h-10 w-10 text-blue-600" />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-slate-900">
          User Information
        </h2>

        <p className="mt-2 text-lg text-slate-500">
          Information of the currently logged-in user.
        </p>

        {/* Information Grid */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">

          {/* Name */}
          <div className="rounded-2xl border border-slate-200 p-7">
            <div className="flex items-center gap-3">
              <FiUser className="h-6 w-6 text-blue-600" />

              <span className="text-lg text-slate-500">
                Name
              </span>
            </div>

            <p className="mt-5 text-2xl font-bold text-slate-900">
              {user.name || "Not available"}
            </p>
          </div>

          {/* Email */}
          <div className="rounded-2xl border border-slate-200 p-7">
            <div className="flex items-center gap-3">
              <FiMail className="h-6 w-6 text-blue-600" />

              <span className="text-lg text-slate-500">
                Email
              </span>
            </div>

            <p className="mt-5 break-all text-xl font-bold text-slate-900">
              {user.email || "Not available"}
            </p>
          </div>

          {/* Role */}
          <div className="rounded-2xl border border-slate-200 p-7">
            <div className="flex items-center gap-3">
              <FiShield className="h-6 w-6 text-blue-600" />

              <span className="text-lg text-slate-500">
                Role
              </span>
            </div>

            <p className="mt-5 text-2xl font-bold text-slate-900">
              {user.role || "User"}
            </p>
          </div>

          {/* Status */}
          <div className="rounded-2xl border border-slate-200 p-7">
            <div className="flex items-center gap-3">
              <FiCheckCircle className="h-6 w-6 text-green-600" />

              <span className="text-lg text-slate-500">
                Account Status
              </span>
            </div>

            <p className="mt-5 text-2xl font-bold text-green-600">
              Active
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default User;
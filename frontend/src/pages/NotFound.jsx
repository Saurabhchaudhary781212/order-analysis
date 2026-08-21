import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">

      <div className="text-center">

        <p className="text-8xl font-black text-indigo-600">
          404
        </p>

        <h1 className="mt-4 text-3xl font-bold text-slate-900">
          Page Not Found
        </h1>

        <p className="mt-2 text-slate-500">
          The page you're looking for doesn't exist.
        </p>

        <Link
          to="/dashboard"
          className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          Back to Dashboard
        </Link>

      </div>

    </div>
  );
}

export default NotFound;
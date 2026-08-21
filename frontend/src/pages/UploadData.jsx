import { Link } from "react-router-dom";
import FileUploader from "../components/FileUploader";

function UploadData() {
  
  return (
    <div className="min-h-screen bg-slate-100">

      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white shadow-sm">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <Link
            to="/dashboard"
            className="text-2xl font-bold text-slate-900"
          >
            Data Analytics
          </Link>

          <div className="flex items-center gap-6">

            <Link
              to="/dashboard"
              className="font-medium text-slate-600 hover:text-indigo-600"
            >
              Dashboard
            </Link>

            <Link
              to="/upload"
              className="font-semibold text-indigo-600"
            >
              Upload
            </Link>

            <Link
              to="/analytics"
              className="font-medium text-slate-600 hover:text-indigo-600"
            >
              Analytics
            </Link>

          </div>

        </div>

      </nav>


      {/* Page */}
      <main className="mx-auto max-w-7xl px-6 py-10">

        <div className="mb-8">

          <h1 className="text-4xl font-bold text-slate-900">
            Upload Data
          </h1>

          <p className="mt-2 text-lg text-slate-500">
            Upload one or multiple datasets for analysis.
          </p>

        </div>


        {/* Supported formats */}
        <div className="mb-8 grid gap-5 md:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-4 text-3xl">
              📄
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              CSV
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Comma-separated data files.
            </p>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-4 text-3xl">
              🗂️
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              JSON
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Structured JSON datasets.
            </p>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-4 text-3xl">
              📝
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              XML
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              XML structured data.
            </p>

          </div>

        </div>


        {/* File uploader */}
        <div className="rounded-2xl bg-white p-8 shadow-lg">

          <FileUploader />

        </div>

      </main>

    </div>
  );
}

export default UploadData
import { useEffect, useMemo, useState } from "react";

import {
  Bar,
  Line,
  Doughnut,
} from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import {
  FiDatabase,
  FiColumns,
  FiHash,
  FiAlertTriangle,
  FiFileText,
  FiRefreshCw,
  FiUploadCloud,
  FiCopy,
} from "react-icons/fi";

import { Link } from "react-router-dom";


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);
const chartColors = [
  "#4F46E5", // Indigo
  "#06B6D4", // Cyan
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#F97316", // Orange
  "#3B82F6", // Blue
];


function Dashboard() {

  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);


  // --------------------------------------------------
  // LOAD DATASET
  // --------------------------------------------------

  const loadDataset = () => {

    try {

      /*
       * First try the structure saved by FileUpload.jsx
       */

      const savedDataset =
        sessionStorage.getItem("dataset");


      if (savedDataset) {

        const parsed = JSON.parse(savedDataset);

        console.log(
          "Dashboard dataset:",
          parsed
        );

        setDataset(parsed);
        setLoading(false);

        return;
      }


      /*
       * Fallback:
       * Try complete analysis result
       */

      const savedAnalysis =
        sessionStorage.getItem(
          "analysisResult"
        );


      if (savedAnalysis) {

        const parsed =
          JSON.parse(savedAnalysis);

        console.log(
          "Dashboard analysis:",
          parsed
        );


        /*
         * Convert analysis response
         * into dashboard structure
         */

        const results =
          parsed.results || [];


        const allRows = [];

        const allColumns = new Set();


        results.forEach((file) => {

          if (
            Array.isArray(file.column_names)
          ) {

            file.column_names.forEach(
              (column) =>
                allColumns.add(column)
            );

          }


          if (
            Array.isArray(file.preview)
          ) {

            file.preview.forEach((row) => {

              allRows.push(row);

            });

          }

        });


        const convertedDataset = {

          files: results,

          combined_data: {

            rows: allRows,

            columns:
              Array.from(allColumns),

          },

          summary:
            parsed.summary || {},

          analysis_results:
            results,

        };


        sessionStorage.setItem(
          "dataset",
          JSON.stringify(
            convertedDataset
          )
        );


        setDataset(
          convertedDataset
        );

        setLoading(false);

        return;
      }


      setDataset(null);
      setLoading(false);

    } catch (error) {

      console.error(
        "Dataset loading error:",
        error
      );

      setDataset(null);
      setLoading(false);

    }

  };


  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

  useEffect(() => {

    loadDataset();


    const handleStorage = () => {

      loadDataset();

    };


    window.addEventListener(
      "storage",
      handleStorage
    );


    return () => {

      window.removeEventListener(
        "storage",
        handleStorage
      );

    };

  }, []);


  // --------------------------------------------------
  // COMBINED DATA
  // --------------------------------------------------

  const combinedData =
    dataset?.combined_data || {};


  const rows = Array.isArray(
    combinedData.rows
  )
    ? combinedData.rows
    : [];


  const columns = Array.isArray(
    combinedData.columns
  )
    ? combinedData.columns
    : [];


  // --------------------------------------------------
  // UPLOADED FILES
  // --------------------------------------------------

  const uploadedFiles =
    Array.isArray(dataset?.files)
      ? dataset.files
      : [];


  // --------------------------------------------------
  // SUMMARY FROM BACKEND
  // --------------------------------------------------

  const backendSummary =
    dataset?.summary || {};


  // --------------------------------------------------
  // NUMERIC COLUMNS
  // --------------------------------------------------

  const numericColumns = useMemo(() => {

    if (!rows.length) {
      return [];
    }


    return columns.filter(
      (column) => {

        const values = rows
          .map(
            (row) =>
              row[column]
          )
          .filter(
            (value) =>
              value !== null &&
              value !== undefined &&
              value !== ""
          );


        if (!values.length) {
          return false;
        }


        const numericValues =
          values.filter(
            (value) =>
              !isNaN(
                Number(value)
              )
          );


        return (
          numericValues.length /
            values.length >=
          0.7
        );

      }
    );

  }, [rows, columns]);


  // --------------------------------------------------
  // CATEGORY COLUMNS
  // --------------------------------------------------

  const categoryColumns = useMemo(() => {

    if (!rows.length) {
      return [];
    }


    return columns.filter(
      (column) => {

        const values = rows
          .map(
            (row) =>
              row[column]
          )
          .filter(
            (value) =>
              value !== null &&
              value !== undefined &&
              value !== ""
          );


        if (!values.length) {
          return false;
        }


        const uniqueValues =
          new Set(
            values.map(
              (value) =>
                String(value)
            )
          );


        return (
          uniqueValues.size > 1 &&
          uniqueValues.size <=
            Math.min(
              20,
              values.length
            )
        );

      }
    );

  }, [rows, columns]);


  // --------------------------------------------------
  // NUMERIC VALUE COUNT
  // --------------------------------------------------

  const numericValueCount =
    useMemo(() => {

      let count = 0;


      rows.forEach((row) => {

        numericColumns.forEach(
          (column) => {

            const value =
              row[column];


            if (
              value !== null &&
              value !== undefined &&
              value !== "" &&
              !isNaN(
                Number(value)
              )
            ) {

              count++;

            }

          }
        );

      });


      return count;

    }, [
      rows,
      numericColumns,
    ]);


  // --------------------------------------------------
  // MISSING VALUES
  // --------------------------------------------------

  const calculatedMissingValues =
    useMemo(() => {

      let count = 0;


      rows.forEach((row) => {

        columns.forEach(
          (column) => {

            const value =
              row[column];


            if (
              value === null ||
              value === undefined ||
              String(value).trim() === ""
            ) {

              count++;

            }

          }
        );

      });


      return count;

    }, [rows, columns]);


  const missingValues =
    backendSummary.missing_values ??
    calculatedMissingValues;


  // --------------------------------------------------
  // DUPLICATES
  // --------------------------------------------------

  const duplicates =
    backendSummary.duplicates ?? 0;


  // --------------------------------------------------
  // TOTAL NUMERIC VALUE
  // --------------------------------------------------

  const totalNumericValue =
    useMemo(() => {

      let total = 0;


      rows.forEach((row) => {

        numericColumns.forEach(
          (column) => {

            const value =
              Number(
                row[column]
              );


            if (!isNaN(value)) {

              total += value;

            }

          }
        );

      });


      return total;

    }, [
      rows,
      numericColumns,
    ]);


  // --------------------------------------------------
  // SALES / REVENUE COLUMN
  // --------------------------------------------------

  const salesColumn =
    useMemo(() => {

      const possibleNames = [
        "sales",
        "sale",
        "revenue",
        "amount",
        "total",
        "price",
        "income",
        "profit",
        "order_value",
        "order value",
        "total_amount",
        "total amount",
      ];


      return numericColumns.find(
        (column) => {

          const normalized =
            column
              .toLowerCase()
              .replace(
                /[_-]/g,
                " "
              );


          return possibleNames.some(
            (name) =>
              normalized.includes(
                name
              )
          );

        }
      );

    }, [numericColumns]);


  // --------------------------------------------------
  // QUANTITY COLUMN
  // --------------------------------------------------

  const quantityColumn =
    useMemo(() => {

      const possibleNames = [
        "quantity",
        "qty",
        "units",
        "items",
        "count",
      ];


      return numericColumns.find(
        (column) => {

          const normalized =
            column
              .toLowerCase()
              .replace(
                /[_-]/g,
                " "
              );


          return possibleNames.some(
            (name) =>
              normalized.includes(
                name
              )
          );

        }
      );

    }, [numericColumns]);


  // --------------------------------------------------
  // TOTAL REVENUE
  // --------------------------------------------------

  const totalRevenue =
    useMemo(() => {

      if (!salesColumn) {
        return null;
      }


      return rows.reduce(
        (sum, row) => {

          const value =
            Number(
              row[salesColumn]
            );


          return (
            sum +
            (isNaN(value)
              ? 0
              : value)
          );

        },
        0
      );

    }, [
      rows,
      salesColumn,
    ]);


  // --------------------------------------------------
  // TOTAL QUANTITY
  // --------------------------------------------------

  const totalQuantity =
    useMemo(() => {

      if (!quantityColumn) {
        return null;
      }


      return rows.reduce(
        (sum, row) => {

          const value =
            Number(
              row[quantityColumn]
            );


          return (
            sum +
            (isNaN(value)
              ? 0
              : value)
          );

        },
        0
      );

    }, [
      rows,
      quantityColumn,
    ]);


  // --------------------------------------------------
  // CATEGORY DATA
  // --------------------------------------------------

  const categoryData =
    useMemo(() => {

      if (
        !categoryColumns.length ||
        !rows.length
      ) {

        return null;

      }


      const categoryColumn =
        categoryColumns.find(
          (column) => {

            const name =
              column.toLowerCase();


            return (
              name.includes(
                "category"
              ) ||
              name.includes(
                "product"
              ) ||
              name.includes(
                "type"
              ) ||
              name.includes(
                "status"
              ) ||
              name.includes(
                "region"
              ) ||
              name.includes(
                "city"
              ) ||
              name.includes(
                "country"
              )
            );

          }
        ) ||
        categoryColumns[0];


      const counts = {};


      rows.forEach((row) => {

        const value =
          row[categoryColumn];


        if (
          value !== null &&
          value !== undefined &&
          String(value).trim() !== ""
        ) {

          const key =
            String(value);


          counts[key] =
            (counts[key] || 0) +
            1;

        }

      });


      const sorted =
        Object.entries(counts)
          .sort(
            (a, b) =>
              b[1] - a[1]
          )
          .slice(0, 10);


      return {

        column:
          categoryColumn,

        labels:
          sorted.map(
            ([key]) =>
              key
          ),

        values:
          sorted.map(
            ([, value]) =>
              value
          ),

      };

    }, [
      categoryColumns,
      rows,
    ]);


  // --------------------------------------------------
  // BAR CHART
  // --------------------------------------------------

  const barChartData = useMemo(() => {
  if (!categoryData) {
    return null;
  }

  return {
    labels: categoryData.labels,

    datasets: [
      {
        label: `Records by ${categoryData.column}`,

        data: categoryData.values,

        backgroundColor: categoryData.labels.map(
          (_, index) => chartColors[index % chartColors.length]
        ),

        borderColor: categoryData.labels.map(
          (_, index) => chartColors[index % chartColors.length]
        ),

        borderWidth: 1,

        borderRadius: 8,

        borderSkipped: false,

        hoverBackgroundColor: categoryData.labels.map(
          (_, index) => chartColors[index % chartColors.length]
        ),
      },
    ],
  };
}, [categoryData]);


  // --------------------------------------------------
  // NUMERIC CHART
  // --------------------------------------------------

  const numericChartData =
    useMemo(() => {

      if (
        !numericColumns.length ||
        !rows.length
      ) {

        return null;

      }


      const column =
        salesColumn ||
        numericColumns[0];


      const values =
        rows
          .map(
            (row) =>
              Number(
                row[column]
              )
          )
          .filter(
            (value) =>
              !isNaN(value)
          )
          .slice(0, 50);


      return {

        labels:
          values.map(
            (_, index) =>
              `Row ${index + 1}`
          ),

       datasets: [
  {
    label: column,

    data: values,

    borderColor: "#4F46E5",

    backgroundColor: "rgba(79, 70, 229, 0.12)",

    pointBackgroundColor: "#4F46E5",

    pointBorderColor: "#ffffff",

    pointBorderWidth: 2,

    pointRadius: 4,

    pointHoverRadius: 7,

    borderWidth: 3,

    tension: 0.35,

    fill: true,
  },
],

      };

    }, [
      numericColumns,
      rows,
      salesColumn,
    ]);


  // --------------------------------------------------
  // DOUGHNUT
  // --------------------------------------------------

const doughnutData = useMemo(() => {
  if (!categoryData) {
    return null;
  }

  return {
    labels: categoryData.labels,

    datasets: [
      {
        data: categoryData.values,

        backgroundColor: [
          "#4F46E5",
          "#06B6D4",
          "#10B981",
          "#F59E0B",
          "#EF4444",
          "#8B5CF6",
          "#EC4899",
          "#14B8A6",
          "#F97316",
          "#3B82F6",
        ],

        borderColor: "#ffffff",
        borderWidth: 3,

        hoverOffset: 12,
      },
    ],
  };
}, [categoryData]);

  // --------------------------------------------------
  // LOADING SCREEN
  // --------------------------------------------------

  if (loading) {

    return (

      <div className="min-h-screen bg-slate-50 flex items-center justify-center">

        <div className="text-center">

          <FiRefreshCw
            size={30}
            className="mx-auto animate-spin text-blue-600"
          />

          <p className="mt-3 text-slate-500">
            Loading analytics...
          </p>

        </div>

      </div>

    );

  }


  // --------------------------------------------------
  // NO DATA SCREEN
  // --------------------------------------------------

  if (!dataset || !rows.length) {

    return (

      <div className="min-h-screen bg-slate-50">

        <div className="border-b bg-white">

          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

            <h1 className="text-2xl font-bold text-slate-800">
              Data Analytics
            </h1>


            <Link
              to="/upload"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
            >

              <FiUploadCloud />

              Upload Data

            </Link>

          </div>

        </div>


        <div className="mx-auto flex max-w-7xl justify-center px-6 py-20">

          <div className="w-full max-w-xl rounded-2xl bg-white p-10 text-center shadow-sm">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">

              <FiDatabase
                size={30}
                className="text-blue-600"
              />

            </div>


            <h2 className="text-2xl font-bold text-slate-800">
              No Dataset Uploaded
            </h2>


            <p className="mt-3 text-slate-500">

              Upload CSV, JSON or XML files
              to generate your dynamic
              analytics dashboard.

            </p>


            <Link
              to="/upload"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >

              <FiUploadCloud />

              Upload Dataset

            </Link>

          </div>

        </div>

      </div>

    );

  }


  // --------------------------------------------------
  // MAIN DASHBOARD
  // --------------------------------------------------

  return (

    <div className="min-h-screen bg-slate-50">


      {/* HEADER */}

      <div className="border-b bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div>

            <h1 className="text-2xl font-bold text-slate-800">
              Data Analytics Dashboard
            </h1>


            <p className="text-sm text-slate-500">

              Dynamic analysis of your uploaded
              dataset

            </p>

          </div>


          <div className="flex gap-3">

            <Link
              to="/upload"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
            >

              <FiUploadCloud />

              Upload New Data

            </Link>


            <button
              onClick={loadDataset}
              className="rounded-lg border bg-white px-4 py-2.5 hover:bg-slate-50"
              title="Refresh data"
            >

              <FiRefreshCw />

            </button>

          </div>

        </div>

      </div>


      {/* CONTENT */}

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">


        {/* DATASET INFORMATION */}

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div>

              <h2 className="text-lg font-bold text-slate-800">
                Current Dataset
              </h2>


              <p className="mt-1 text-sm text-slate-500">

                {uploadedFiles.length
                  ? `${uploadedFiles.length} file(s) uploaded`
                  : "Processed dataset"}

              </p>

            </div>


            <div className="flex flex-wrap gap-2">

              {uploadedFiles.map(
                (file, index) => (

                  <span
                    key={index}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                  >

                    {file.filename ||
                      file.name ||
                      `File ${index + 1}`}

                  </span>

                )
              )}

            </div>

          </div>

        </div>


        {/* KPI CARDS */}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">


          {/* FILES */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Files
                </p>

                <h3 className="mt-2 text-3xl font-bold text-slate-800">

                  {backendSummary.files ??
                    uploadedFiles.length}

                </h3>

              </div>


              <div className="rounded-xl bg-blue-100 p-3">

                <FiFileText
                  size={24}
                  className="text-blue-600"
                />

              </div>

            </div>

          </div>


          {/* RECORDS */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Total Records
                </p>

                <h3 className="mt-2 text-3xl font-bold text-slate-800">

                  {backendSummary.rows ??
                    rows.length}

                </h3>

              </div>


              <div className="rounded-xl bg-blue-100 p-3">

                <FiDatabase
                  size={24}
                  className="text-blue-600"
                />

              </div>

            </div>

          </div>


          {/* COLUMNS */}

          {/* <div className="rounded-2xl bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between text-sm">

              <div>

                <p className="text-sm text-slate-500">
                  Columns
                </p>

                <h3 className="mt-2 text-3xl font-bold text-slate-800">

                  {backendSummary.columns ??
                    columns.length}

                </h3>

              </div>


              <div className="rounded-xl bg-purple-100 p-3">

                <FiColumns
                  size={24}
                  className="text-purple-600"
                />

              </div>

            </div>

          </div> */}


          {/* NUMERIC VALUES */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Numeric Values
                </p>

                <h3 className="mt-2 text-3xl font-bold text-slate-800">

                  {numericValueCount.toLocaleString()}

                </h3>

              </div>


              <div className="rounded-xl bg-green-100 p-3">

                <FiHash
                  size={24}
                  className="text-green-600"
                />

              </div>

            </div>

          </div>


          {/* MISSING */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Missing Values
                </p>

                <h3 className="mt-2 text-3xl font-bold text-slate-800">

                  {missingValues.toLocaleString()}

                </h3>

              </div>


              <div className="rounded-xl bg-red-100 p-3">

                <FiAlertTriangle
                  size={24}
                  className="text-red-600"
                />

              </div>

            </div>

          </div>

        </div>


        {/* SECONDARY SUMMARY */}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">


          {/* DUPLICATES */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <p className="text-sm text-slate-500">
              Duplicate Records
            </p>


            <h3 className="mt-2 text-2xl font-bold text-slate-800">

              {duplicates.toLocaleString()}

            </h3>

          </div>


          {/* REVENUE */}

          {salesColumn && (

            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <p className="text-sm text-slate-500">

                Total {salesColumn}

              </p>


              <h3 className="mt-2 text-2xl font-bold text-slate-800">

                {totalRevenue?.toLocaleString(
                  undefined,
                  {
                    maximumFractionDigits: 2,
                  }
                )}

              </h3>

            </div>

          )}


          {/* QUANTITY */}

          {quantityColumn && (

            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <p className="text-sm text-slate-500">

                Total {quantityColumn}

              </p>


              <h3 className="mt-2 text-2xl font-bold text-slate-800">

                {totalQuantity?.toLocaleString(
                  undefined,
                  {
                    maximumFractionDigits: 2,
                  }
                )}

              </h3>

            </div>

          )}


          {/* NUMERIC SUM */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <p className="text-sm text-slate-500">
              Numeric Data Sum
            </p>


            <h3 className="mt-2 text-2xl font-bold text-slate-800">

              {totalNumericValue.toLocaleString(
                undefined,
                {
                  maximumFractionDigits: 2,
                }
              )}

            </h3>

          </div>

        </div>


        {/* CHARTS */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">


          {/* BAR CHART */}

          {barChartData && (

            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <div className="mb-5">

                <h2 className="text-lg font-bold text-slate-800">
                  Category Distribution
                </h2>


                <p className="text-sm text-slate-500">

                  Automatically generated from{" "}

                  <b>
                    {categoryData.column}
                  </b>

                </p>

              </div>


              <div className="h-[350px]">
<Bar
  data={barChartData}
  options={{
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        backgroundColor: "#0f172a",
        titleColor: "#ffffff",
        bodyColor: "#e2e8f0",
        padding: 12,
        cornerRadius: 8,
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },

        ticks: {
          color: "#64748b",
        },
      },

      y: {
        beginAtZero: true,

        grid: {
          color: "#e2e8f0",
        },

        ticks: {
          color: "#64748b",
        },
      },
    },

    animation: {
      duration: 600,
    },
  }}
/>

              </div>

            </div>

          )}


          {/* DOUGHNUT */}

          {doughnutData && (

            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <div className="mb-5">

                <h2 className="text-lg font-bold text-slate-800">
                  Data Distribution
                </h2>


                <p className="text-sm text-slate-500">

                  Based on{" "}

                  {categoryData.column}

                </p>

              </div>


              <div className="h-[350px]">

                <Doughnut
  data={doughnutData}
  options={{
    responsive: true,
    maintainAspectRatio: false,

    cutout: "65%",

    plugins: {
      legend: {
        position: "bottom",

        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 16,

          font: {
            size: 12,
          },

          color: "#475569",
        },
      },

      tooltip: {
        backgroundColor: "#0f172a",
        titleColor: "#ffffff",
        bodyColor: "#e2e8f0",

        padding: 12,
        cornerRadius: 8,
      },
    },

    animation: {
      duration: 700,
    },
  }}
/>

              </div>

            </div>

          )}

        </div>


        {/* NUMERIC CHART */}

        {numericChartData && (

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <div className="mb-5">

              <h2 className="text-lg font-bold text-slate-800">
                Numeric Data Trend
              </h2>


              <p className="text-sm text-slate-500">

                Automatically using{" "}

                <b>
                  {salesColumn ||
                    numericColumns[0]}
                </b>

              </p>

            </div>


            <div className="h-[350px]">

           <Line
  data={numericChartData}
  options={{
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: "bottom",

        labels: {
          usePointStyle: true,
          padding: 16,
          color: "#475569",
        },
      },

      tooltip: {
        backgroundColor: "#0f172a",
        titleColor: "#ffffff",
        bodyColor: "#e2e8f0",
        padding: 12,
        cornerRadius: 8,
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },

        ticks: {
          color: "#64748b",
          maxTicksLimit: 10,
        },
      },

      y: {
        beginAtZero: true,

        grid: {
          color: "#e2e8f0",
        },

        ticks: {
          color: "#64748b",
        },
      },
    },

    animation: {
      duration: 600,
    },
  }}
/>

            </div>

          </div>

        )}


        {/* DATA TYPES */}

        {columns.length > 0 && (

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <div className="mb-5">

              <h2 className="text-lg font-bold text-slate-800">
                Column Information
              </h2>


              <p className="text-sm text-slate-500">
                Automatically detected data types
              </p>

            </div>


            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

              {columns.map(
                (column) => {

                  const isNumeric =
                    numericColumns.includes(
                      column
                    );


                  return (

                    <div
                      key={column}
                      className="rounded-xl border bg-slate-50 p-4"
                    >

                      <p className="font-semibold text-slate-700 break-all">
                        {column}
                      </p>


                      <span
                        className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                          isNumeric
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >

                        {isNumeric
                          ? "Numeric"
                          : "Text / Category"}

                      </span>

                    </div>

                  );

                }
              )}

            </div>

          </div>

        )}


        {/* DATA PREVIEW */}

        <div className="rounded-2xl bg-white p-6 shadow-sm">

          <div className="mb-5 flex items-center justify-between">

            <div>

              <h2 className="text-lg font-bold text-slate-800">
                Data Preview
              </h2>


              <p className="text-sm text-slate-500">

                Showing available rows
                from uploaded files

              </p>

            </div>


            <FiFileText
              size={24}
            />

          </div>


          <div className="overflow-x-auto">

            <table className="min-w-full text-left text-sm">

              <thead>

                <tr className="border-b bg-slate-50">

                  {columns.map(
                    (column) => (

                      <th
                        key={column}
                        className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700"
                      >

                        {column}

                      </th>

                    )
                  )}

                </tr>

              </thead>


              <tbody>

                {rows
                  .slice(0, 10)
                  .map(
                    (row, index) => (

                      <tr
                        key={index}
                        className="border-b hover:bg-slate-50"
                      >

                        {columns.map(
                          (column) => (

                            <td
                              key={column}
                              className="whitespace-nowrap px-4 py-3 text-slate-600"
                            >

                              {row[column] ===
                                null ||
                              row[column] ===
                                undefined ||
                              row[column] ===
                                ""
                                ? "-"
                                : String(
                                    row[
                                      column
                                    ]
                                  )}

                            </td>

                          )
                        )}

                      </tr>

                    )
                  )}

              </tbody>

            </table>

          </div>

        </div>


      </main>

    </div>

  );

}


export default Dashboard;
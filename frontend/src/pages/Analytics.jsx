import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  Line,
  Doughnut
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
  Legend
} from "chart.js";

import {
  FiDatabase,
  FiColumns,
  FiHash,
  FiAlertTriangle,
  FiRefreshCw,
  FiUpload,
  FiShoppingBag,
  FiMapPin,
  FiTrendingUp
} from "react-icons/fi";

import { Link } from "react-router-dom";

import "./Analytics.css";
const chartColors = [
  "#4F46E5",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
];


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



function Analytics() {

  const [dataset, setDataset] = useState(null);


  /* =========================================
     LOAD DATASET
  ========================================= */

  const loadDataset = () => {

    try {

      const saved =
        sessionStorage.getItem("dataset");

      if (!saved) {
        setDataset(null);
        return;
      }

      const parsed =
        JSON.parse(saved);

      console.log(
        "Analytics dataset:",
        parsed
      );

      setDataset(parsed);

    } catch (error) {

      console.error(
        "Analytics dataset error:",
        error
      );

      setDataset(null);
    }
  };


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


  /* =========================================
     DATA
  ========================================= */

  const combinedData =
    dataset?.combined_data || {};

  const rows =
    Array.isArray(combinedData.rows)
      ? combinedData.rows
      : [];

  const columns =
    Array.isArray(combinedData.columns)
      ? combinedData.columns
      : [];

  const uploadedFiles =
    Array.isArray(dataset?.files)
      ? dataset.files
      : [];


  /* =========================================
     NUMERIC COLUMNS
  ========================================= */

  const numericColumns = useMemo(() => {

    if (!rows.length) return [];

    return columns.filter((column) => {

      const values = rows
        .map((row) => row[column])
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
            !isNaN(Number(value))
        );

      return (
        numericValues.length /
          values.length >=
        0.7
      );

    });

  }, [rows, columns]);


  /* =========================================
     CATEGORY COLUMNS
  ========================================= */

  const categoryColumns = useMemo(() => {

    if (!rows.length) return [];

    return columns.filter((column) => {

      const values = rows
        .map((row) => row[column])
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
          values.map((value) =>
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

    });

  }, [rows, columns]);


  /* =========================================
     FIND SALES COLUMN
  ========================================= */

  const salesColumn = useMemo(() => {

    const names = [
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
      "total amount"
    ];

    return numericColumns.find(
      (column) => {

        const normalized =
          column
            .toLowerCase()
            .replace(/[_-]/g, " ");

        return names.some(
          (name) =>
            normalized.includes(name)
        );
      }
    );

  }, [numericColumns]);


  /* =========================================
     FIND QUANTITY COLUMN
  ========================================= */

  const quantityColumn = useMemo(() => {

    const names = [
      "quantity",
      "qty",
      "units",
      "items",
      "count"
    ];

    return numericColumns.find(
      (column) => {

        const normalized =
          column
            .toLowerCase()
            .replace(/[_-]/g, " ");

        return names.some(
          (name) =>
            normalized.includes(name)
        );
      }
    );

  }, [numericColumns]);


  /* =========================================
     FIND CATEGORY COLUMN
  ========================================= */

  const categoryColumn = useMemo(() => {

    const preferred = categoryColumns.find(
      (column) => {

        const name =
          column.toLowerCase();

        return (
          name.includes("category") ||
          name.includes("product") ||
          name.includes("type") ||
          name.includes("status") ||
          name.includes("region") ||
          name.includes("country")
        );

      }
    );

    return (
      preferred ||
      categoryColumns[0] ||
      null
    );

  }, [categoryColumns]);


  /* =========================================
     FIND CITY COLUMN
  ========================================= */

  const cityColumn = useMemo(() => {

    return columns.find(
      (column) =>
        column
          .toLowerCase()
          .includes("city")
    );

  }, [columns]);


  /* =========================================
     NUMERIC VALUE COUNT
  ========================================= */

  const numericValueCount = useMemo(() => {

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
            !isNaN(Number(value))
          ) {
            count++;
          }

        }
      );

    });

    return count;

  }, [rows, numericColumns]);


  /* =========================================
     MISSING VALUES
  ========================================= */

  const missingValues = useMemo(() => {

    let count = 0;

    rows.forEach((row) => {

      columns.forEach((column) => {

        const value =
          row[column];

        if (
          value === null ||
          value === undefined ||
          String(value).trim() === ""
        ) {
          count++;
        }

      });

    });

    return count;

  }, [rows, columns]);


  /* =========================================
     DUPLICATES
  ========================================= */

  const duplicateRows = useMemo(() => {

    const seen = new Set();

    let duplicates = 0;

    rows.forEach((row) => {

      const key =
        JSON.stringify(row);

      if (seen.has(key)) {
        duplicates++;
      } else {
        seen.add(key);
      }

    });

    return duplicates;

  }, [rows]);


  /* =========================================
     TOTAL NUMERIC SUM
  ========================================= */

  const totalNumericValue =
    useMemo(() => {

      let total = 0;

      rows.forEach((row) => {

        numericColumns.forEach(
          (column) => {

            const value =
              Number(row[column]);

            if (!isNaN(value)) {
              total += value;
            }

          }
        );

      });

      return total;

    }, [rows, numericColumns]);


  /* =========================================
     TOTAL SALES
  ========================================= */

  const totalSales =
    useMemo(() => {

      if (!salesColumn) {
        return null;
      }

      return rows.reduce(
        (sum, row) => {

          const value =
            Number(row[salesColumn]);

          return (
            sum +
            (isNaN(value)
              ? 0
              : value)
          );

        },
        0
      );

    }, [rows, salesColumn]);


  /* =========================================
     TOTAL QUANTITY
  ========================================= */

  const totalQuantity =
    useMemo(() => {

      if (!quantityColumn) {
        return null;
      }

      return rows.reduce(
        (sum, row) => {

          const value =
            Number(row[quantityColumn]);

          return (
            sum +
            (isNaN(value)
              ? 0
              : value)
          );

        },
        0
      );

    }, [rows, quantityColumn]);


  /* =========================================
     CATEGORY DATA
  ========================================= */

  const categoryData =
    useMemo(() => {

      if (
        !categoryColumn ||
        !rows.length
      ) {
        return null;
      }

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
            (counts[key] || 0) + 1;

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
            ([key]) => key
          ),

        values:
          sorted.map(
            ([, value]) =>
              value
          )

      };

    }, [
      categoryColumn,
      rows
    ]);


  /* =========================================
     CITY DATA
  ========================================= */

  const cityData =
    useMemo(() => {

      if (
        !cityColumn ||
        !rows.length
      ) {
        return null;
      }

      const counts = {};

      rows.forEach((row) => {

        const value =
          row[cityColumn];

        if (
          value !== null &&
          value !== undefined &&
          String(value).trim() !== ""
        ) {

          const key =
            String(value);

          counts[key] =
            (counts[key] || 0) + 1;

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

        labels:
          sorted.map(
            ([key]) => key
          ),

        values:
          sorted.map(
            ([, value]) =>
              value
          )

      };

    }, [
      cityColumn,
      rows
    ]);


  /* =========================================
     CATEGORY BAR CHART
  ========================================= */

const categoryChart = categoryData
  ? {
      labels: categoryData.labels,

      datasets: [
        {
          label: "Orders",

          data: categoryData.values,

          backgroundColor: chartColors,

          borderRadius: 8,

          borderSkipped: false,
        },
      ],
    }
  : null;

  /* =========================================
     DOUGHNUT CHART
  ========================================= */

 const doughnutChart = categoryData
  ? {
      labels: categoryData.labels,

      datasets: [
        {
          data: categoryData.values,

          backgroundColor: chartColors,

          borderColor: "#ffffff",

          borderWidth: 3,

          hoverOffset: 10,
        },
      ],
    }
  : null;


  /* =========================================
     CITY CHART
  ========================================= */

  const cityChart =
    cityData
      ? {
          labels:
            cityData.labels,

          datasets: [
            {
              label:
                "Orders",

              data:
                cityData.values,

              borderWidth: 1
            }
          ]
        }
      : null;


  /* =========================================
     NUMERIC TREND
  ========================================= */

  const numericChart =
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
          .map((row) =>
            Number(row[column])
          )
          .filter(
            (value) =>
              !isNaN(value)
          )
          .slice(0, 30);

          return {
        labels: values.map(
          (_, index) => `Row ${index + 1}`
        ),

        datasets: [
          {
            label: column,
            data: values,

            borderColor: "#4F46E5",
            backgroundColor: "rgba(79, 70, 229, 0.12)",

            fill: true,
            tension: 0.4,

            pointRadius: 4,
            pointHoverRadius: 7,

            borderWidth: 3,
          },
        ],
      };
    }, [
      numericColumns,
      rows,
      salesColumn
    ]);


  /* =========================================
     NO DATA
  ========================================= */

  if (!dataset || !rows.length) {

    return (

      <div className="analytics-page">

        <div className="analytics-empty">

          <div className="analytics-empty-icon">
            <FiDatabase />
          </div>

          <h1>
            No Dataset Uploaded
          </h1>

          <p>
            Upload a CSV, JSON or XML
            file to generate your
            analytics dashboard.
          </p>

          <Link
            to="/upload"
            className="analytics-primary-btn"
          >
            <FiUpload />
            Upload Dataset
          </Link>

        </div>

      </div>

    );

  }




  return (

    <div className="analytics-page">

    

     <header className="analytics-header">

        <div>

          <h1>
            Analytics Dashboard
          </h1>

          <p>
            Analyze your uploaded
            dataset
          </p>

        </div>

        <div className="analytics-actions">

          <Link
            to="/upload"
            className="analytics-primary-btn"
          >
            <FiUpload />
            Upload New Data
          </Link>

          <button
            className="analytics-refresh-btn"
            onClick={loadDataset}
            title="Refresh"
          >
            <FiRefreshCw />
          </button>

        </div>

      </header>


      {/* DATASET */}

      <section className="dataset-card">

        <div>

          <h2>
            Current Dataset
          </h2>

          <p>
            {uploadedFiles.length}
            {" "}
            file(s) uploaded
          </p>

        </div>

        <div className="file-list">

          {uploadedFiles.map(
            (file, index) => (

              <span
                key={index}
                className="file-badge"
              >
                <FiFileIcon />
                {file.filename ||
                  file.name ||
                  `File ${index + 1}`}
              </span>

            )
          )}

        </div>

      </section>


      {/* KPI */}

      <section className="analytics-kpi-grid">

        <div className="analytics-card">

          <div className="card-content">

            <span>
              Total Records
            </span>

            <strong>
              {rows.length.toLocaleString()}
            </strong>

          </div>

          <div className="card-icon blue">
            <FiDatabase />
          </div>

        </div>


        <div className="analytics-card">

          <div className="card-content">

            <span>
              Columns
            </span>

            <strong>
              {columns.length}
            </strong>

          </div>

          <div className="card-icon purple">
            <FiColumns />
          </div>

        </div>


        <div className="analytics-card">

          <div className="card-content">

            <span>
              Numeric Values
            </span>

            <strong>
              {numericValueCount.toLocaleString()}
            </strong>

          </div>

          <div className="card-icon green">
            <FiHash />
          </div>

        </div>


        <div className="analytics-card">

          <div className="card-content">

            <span>
              Missing Values
            </span>

            <strong>
              {missingValues.toLocaleString()}
            </strong>

          </div>

          <div className="card-icon red">
            <FiAlertTriangle />
          </div>

        </div>

      </section>


      {/* BUSINESS METRICS */}

      <section className="analytics-kpi-grid">

        <div className="analytics-card">

          <div className="card-content">

            <span>
              Total Sales
            </span>

            <strong>

              {totalSales !== null
                ? `₹${totalSales.toLocaleString(
                    undefined,
                    {
                      maximumFractionDigits: 2
                    }
                  )}`
                : "N/A"}

            </strong>

            <small>
              {salesColumn ||
                "Sales column not found"}
            </small>

          </div>

          <div className="card-icon orange">
            <FiTrendingUp />
          </div>

        </div>


        <div className="analytics-card">

          <div className="card-content">

            <span>
              Total Quantity
            </span>

            <strong>

              {totalQuantity !== null
                ? totalQuantity.toLocaleString()
                : "N/A"}

            </strong>

            <small>
              {quantityColumn ||
                "Quantity column not found"}
            </small>

          </div>

          <div className="card-icon green">
            <FiShoppingBag />
          </div>

        </div>


        <div className="analytics-card">

          <div className="card-content">

            <span>
              Numeric Data Sum
            </span>

            <strong>
              {totalNumericValue.toLocaleString(
                undefined,
                {
                  maximumFractionDigits: 2
                }
              )}
            </strong>

          </div>

          <div className="card-icon blue">
            <FiHash />
          </div>

        </div>


        <div className="analytics-card">

          <div className="card-content">

            <span>
              Duplicate Records
            </span>

            <strong>
              {duplicateRows}
            </strong>

          </div>

          <div className="card-icon red">
            <FiAlertTriangle />
          </div>

        </div>

      </section>


      {/* CHARTS */}

      <section className="chart-grid">

        {/* CATEGORY */}

        {categoryChart && (

          <div className="chart-card">

            <div className="chart-header">

              <div>

                <h2>
                  Category Distribution
                </h2>

                <p>
                  Records by{" "}
                  <strong>
                    {categoryData.column}
                  </strong>
                </p>

              </div>

            </div>

            <div className="chart-area">

          <Bar
  data={categoryChart}
  options={{
    responsive: true,
    maintainAspectRatio: false,
       animation: {
      duration: 1800,
      easing: "easeOutQuart",
    },
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
  }}
/>
            </div>

          </div>

        )}


        {/* DOUGHNUT */}

        {doughnutChart && (

          <div className="chart-card">

            <div className="chart-header">

              <div>

                <h2>
                  Data Distribution
                </h2>

                <p>
                  Based on{" "}
                  <strong>
                    {categoryData.column}
                  </strong>
                </p>

              </div>

            </div>

           <Doughnut
  data={doughnutChart}
  options={{
    responsive: true,

    maintainAspectRatio: false,

    cutout: "65%",
 animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1800,
      easing: "easeOutQuart",
    },
    plugins: {
      legend: {
        position: "bottom",

        labels: {
          usePointStyle: true,

          padding: 18,

          font: {
            size: 12,
          },
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
  }}
/>

          </div>

        )}


        {/* CITY */}

        {cityChart && (

          <div className="chart-card">

            <div className="chart-header">

              <div>

                <h2>
                  Orders by City
                </h2>

                <p>
                  Top performing cities
                </p>

              </div>

              <FiMapPin />

            </div>

            <div className="chart-area">

              <Bar
                data={cityChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  }
                }}
              />

            </div>

          </div>

        )}


        {/* NUMERIC TREND */}

        {numericChart && (

          <div className="chart-card">

            <div className="chart-header">

              <div>

                <h2>
                  Numeric Data Trend
                </h2>

                <p>
                  Using{" "}
                  <strong>
                    {salesColumn ||
                      numericColumns[0]}
                  </strong>
                </p>

              </div>

            </div>

            <div className="chart-area">

             <Line
  data={numericChart}
  options={{
    responsive: true,

    maintainAspectRatio: false,
     animation: {
      duration: 2000,
      easing: "easeInOutQuart",
    },

    plugins: {
      legend: {
        position: "bottom",

        labels: {
          usePointStyle: true,

          padding: 18,
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
  }}
/>

            </div>

          </div>

        )}

      </section>


      {/* DATA PREVIEW */}
{/* DATA QUALITY OVERVIEW */}

<section className="analytics-data-summary">

  <div className="summary-header">

    <div>
      <h2>Data Quality Overview</h2>

      <p>
        Quick summary of your uploaded dataset
      </p>
    </div>

    <span className="quality-badge">
      ✓ Dataset Analyzed
    </span>

  </div>


  <div className="quality-grid">

    {/* RECORDS */}

    <div className="quality-item">

      <span className="quality-icon blue">
        📄
      </span>

      <div>
        <small>Total Records</small>

        <strong>
          {rows.length.toLocaleString()}
        </strong>
      </div>

    </div>


    {/* COLUMNS */}

    <div className="quality-item">

      <span className="quality-icon purple">
        🔢
      </span>

      <div>
        <small>Total Columns</small>

        <strong>
          {columns.length}
        </strong>
      </div>

    </div>


    {/* MISSING */}

    <div className="quality-item">

      <span className="quality-icon orange">
        ⚠️
      </span>

      <div>
        <small>Missing Values</small>

        <strong>
          {missingValues.toLocaleString()}
        </strong>
      </div>

    </div>


    {/* DUPLICATES */}

    <div className="quality-item">

      <span className="quality-icon red">
        ♻️
      </span>

      <div>
        <small>Duplicate Rows</small>

        <strong>
          {duplicateRows.toLocaleString()}
        </strong>
      </div>

    </div>

  </div>

</section>
      
    </div>

  );
}


/* Small icon component */

function FiFileIcon() {
  return (
    <span className="file-icon">
      📄
    </span>
  );
}


export default Analytics;
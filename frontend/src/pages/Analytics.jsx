import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  FiDatabase,
  FiColumns,
  FiHash,
  FiAlertTriangle,
  FiRefreshCw,
  FiUpload,
  FiDownload,
  FiTrendingUp,
  FiMapPin,
  FiShoppingBag,
  FiActivity,
  FiCheckCircle,
} from "react-icons/fi";

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
  Filler,
} from "chart.js";

import {
  Line,
  Bar,
  Doughnut,
} from "react-chartjs-2";

import {
  downloadFinalAnalysisReport,
} from "../utils/reportGenerator";

import "./Analytics.css";


// ======================================================
// CHART.JS
// ======================================================

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);


// ======================================================
// HELPERS
// ======================================================

const findColumn = (
  columns,
  keywords
) => {

  return columns.find(
    (column) => {

      const name =
        String(column)
          .toLowerCase()
          .replace(/[\s_-]/g, "");

      return keywords.some(
        (keyword) =>
          name.includes(
            keyword
          )
      );

    }
  );

};


const isNumericColumn = (
  rows,
  column
) => {

  const values =
    rows
      .map(
        (row) =>
          row[column]
      )
      .filter(
        (value) =>
          value !== null &&
          value !== undefined &&
          String(value).trim() !== ""
      );


  if (
    values.length === 0
  ) {
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

};


// ======================================================
// COMPONENT
// ======================================================

const Analytics = () => {

  const [
    dataset,
    setDataset,
  ] = useState(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  // ====================================================
  // LOAD DATASET
  // ====================================================

  const loadDataset = () => {

    setLoading(true);

    try {

      const stored =
        sessionStorage.getItem(
          "dataset"
        );


      if (!stored) {

        setDataset(null);

        return;
      }


      const parsed =
        JSON.parse(
          stored
        );


      setDataset(
        parsed
      );

    } catch (error) {

      console.error(
        "Dataset loading error:",
        error
      );

      setDataset(null);

    } finally {

      setLoading(false);

    }

  };


  useEffect(
    () => {

      loadDataset();

    },
    []
  );


  // ====================================================
  // DATA
  // ====================================================

  const rows =
    dataset?.combined_data?.rows || [];


  const columns =
    dataset?.combined_data?.columns || [];


  const totalRows =
    dataset?.summary?.total_rows ??
    rows.length;


  const totalColumns =
    dataset?.summary?.total_columns ??
    columns.length;


  const totalFiles =
    dataset?.summary?.total_files ??
    dataset?.files?.length ??
    0;


  // ====================================================
  // DETECT IMPORTANT COLUMNS
  // ====================================================

  const detected = useMemo(
    () => {

      return {

        revenue:
          findColumn(
            columns,
            [
              "revenue",
              "sales",
              "sale",
              "amount",
              "price",
              "income",
              "profit",
              "totalamount",
              "totalvalue",
            ]
          ),

        quantity:
          findColumn(
            columns,
            [
              "quantity",
              "qty",
              "units",
            ]
          ),

        category:
          findColumn(
            columns,
            [
              "category",
              "productcategory",
              "type",
              "department",
              "segment",
            ]
          ),

        product:
          findColumn(
            columns,
            [
              "product",
              "productname",
              "item",
              "itemname",
            ]
          ),

        city:
          findColumn(
            columns,
            [
              "city",
              "location",
            ]
          ),

        date:
          findColumn(
            columns,
            [
              "date",
              "orderdate",
              "createdat",
              "time",
              "month",
              "year",
            ]
          ),

        customer:
          findColumn(
            columns,
            [
              "customer",
              "customername",
              "client",
              "userid",
            ]
          ),

      };

    },
    [
      columns
    ]
  );


  // ====================================================
  // NUMERIC COLUMNS
  // ====================================================

  const numericColumns =
    useMemo(
      () =>
        columns.filter(
          (column) =>
            isNumericColumn(
              rows,
              column
            )
        ),
      [
        rows,
        columns
      ]
    );


  // ====================================================
  // MISSING VALUES
  // ====================================================

  const missingValues =
    useMemo(
      () => {

        let count = 0;


        rows.forEach(
          (row) => {

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

          }
        );


        return count;

      },
      [
        rows,
        columns
      ]
    );


  // ====================================================
  // DUPLICATES
  // ====================================================

  const duplicateRows =
    useMemo(
      () => {

        const seen =
          new Set();


        let duplicates = 0;


        rows.forEach(
          (row) => {

            const key =
              JSON.stringify(
                row
              );


            if (
              seen.has(key)
            ) {

              duplicates++;

            } else {

              seen.add(key);

            }

          }
        );


        return duplicates;

      },
      [
        rows
      ]
    );


  // ====================================================
  // TOTAL REVENUE
  // ====================================================

  const totalRevenue =
    useMemo(
      () => {

        if (
          !detected.revenue
        ) {

          return null;

        }


        return rows.reduce(
          (
            total,
            row
          ) => {

            const value =
              Number(
                row[
                  detected.revenue
                ]
              );


            return (
              total +
              (
                isNaN(value)
                  ? 0
                  : value
              )
            );

          },
          0
        );

      },
      [
        rows,
        detected.revenue
      ]
    );


  // ====================================================
  // TOTAL QUANTITY
  // ====================================================

  const totalQuantity =
    useMemo(
      () => {

        if (
          !detected.quantity
        ) {

          return null;

        }


        return rows.reduce(
          (
            total,
            row
          ) => {

            const value =
              Number(
                row[
                  detected.quantity
                ]
              );


            return (
              total +
              (
                isNaN(value)
                  ? 0
                  : value
              )
            );

          },
          0
        );

      },
      [
        rows,
        detected.quantity
      ]
    );


  // ====================================================
  // CATEGORY DATA
  // ====================================================

  const categoryData =
    useMemo(
      () => {

        if (
          !detected.category
        ) {

          return [];

        }


        const counts = {};


        rows.forEach(
          (row) => {

            const value =
              row[
                detected.category
              ];


            if (
              value === null ||
              value === undefined ||
              String(value).trim() === ""
            ) {

              return;

            }


            const key =
              String(value);


            counts[key] =
              (
                counts[key] || 0
              ) + 1;

          }
        );


        return Object.entries(
          counts
        )
        .sort(
          (a, b) =>
            b[1] - a[1]
        );

      },
      [
        rows,
        detected.category
      ]
    );


  // ====================================================
  // PRODUCT DATA
  // ====================================================

  const productData =
    useMemo(
      () => {

        if (
          !detected.product
        ) {

          return [];

        }


        const counts = {};


        rows.forEach(
          (row) => {

            const value =
              row[
                detected.product
              ];


            if (
              value === null ||
              value === undefined ||
              String(value).trim() === ""
            ) {

              return;

            }


            const key =
              String(value);


            counts[key] =
              (
                counts[key] || 0
              ) + 1;

          }
        );


        return Object.entries(
          counts
        )
        .sort(
          (a, b) =>
            b[1] - a[1]
        )
        .slice(
          0,
          10
        );

      },
      [
        rows,
        detected.product
      ]
    );


  // ====================================================
  // CITY DATA
  // ====================================================

  const cityData =
    useMemo(
      () => {

        if (
          !detected.city
        ) {

          return [];

        }


        const counts = {};


        rows.forEach(
          (row) => {

            const value =
              row[
                detected.city
              ];


            if (
              value === null ||
              value === undefined ||
              String(value).trim() === ""
            ) {

              return;

            }


            const key =
              String(value);


            counts[key] =
              (
                counts[key] || 0
              ) + 1;

          }
        );


        return Object.entries(
          counts
        )
        .sort(
          (a, b) =>
            b[1] - a[1]
        )
        .slice(
          0,
          10
        );

      },
      [
        rows,
        detected.city
      ]
    );


  // ====================================================
  // DATE DATA
  // ====================================================

  const dateData =
    useMemo(
      () => {

        if (
          !detected.date
        ) {

          return [];

        }


        const counts = {};


        rows.forEach(
          (row) => {

            const value =
              row[
                detected.date
              ];


            if (
              !value
            ) {

              return;

            }


            const date =
              new Date(
                value
              );


            if (
              isNaN(
                date.getTime()
              )
            ) {

              return;

            }


            const key =
              date
                .toISOString()
                .slice(
                  0,
                  10
                );


            counts[key] =
              (
                counts[key] || 0
              ) + 1;

          }
        );


        return Object.entries(
          counts
        )
        .sort(
          (a, b) =>
            new Date(a[0]) -
            new Date(b[0])
        );

      },
      [
        rows,
        detected.date
      ]
    );


  // ====================================================
  // CHART DATA
  // ====================================================

  const categoryChart = {

    labels:
      categoryData
        .slice(
          0,
          10
        )
        .map(
          ([name]) =>
            name
        ),

    datasets: [
      {

        label:
          "Records",

        data:
          categoryData
            .slice(
              0,
              10
            )
            .map(
              ([, value]) =>
                value
            ),

        borderRadius: 8,

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
          "#84CC16",
        ],

      },
    ],

  };


  const doughnutChart = {

    labels:
      categoryData
        .slice(
          0,
          8
        )
        .map(
          ([name]) =>
            name
        ),

    datasets: [
      {

        data:
          categoryData
            .slice(
              0,
              8
            )
            .map(
              ([, value]) =>
                value
            ),

        backgroundColor: [
          "#4F46E5",
          "#06B6D4",
          "#10B981",
          "#F59E0B",
          "#EF4444",
          "#8B5CF6",
          "#EC4899",
          "#14B8A6",
        ],

        borderWidth: 2,

      },
    ],

  };


  const cityChart = {

    labels:
      cityData.map(
        ([name]) =>
          name
      ),

    datasets: [
      {

        label:
          "Orders",

        data:
          cityData.map(
            ([, value]) =>
              value
          ),

        borderRadius: 8,

        backgroundColor:
          "#4F46E5",

      },
    ],

  };


  const trendChart = {

    labels:
      dateData.map(
        ([date]) =>
          date
      ),

    datasets: [
      {

        label:
          "Records",

        data:
          dateData.map(
            ([, value]) =>
              value
          ),

        borderColor:
          "#4F46E5",

        backgroundColor:
          "rgba(79,70,229,0.10)",

        fill: true,

        tension: 0.35,

        pointRadius: 3,

      },
    ],

  };


  // ====================================================
  // CHART OPTIONS
  // ====================================================

  const barOptions = {

    responsive: true,

    maintainAspectRatio: false,

    plugins: {

      legend: {
        display: false,
      },

    },

    scales: {

      y: {
        beginAtZero: true,
      },

    },

  };


  const lineOptions = {

    responsive: true,

    maintainAspectRatio: false,

    plugins: {

      legend: {
        display: false,
      },

    },

    scales: {

      y: {
        beginAtZero: true,
      },

    },

  };


  const doughnutOptions = {

    responsive: true,

    maintainAspectRatio: false,

    plugins: {

      legend: {
        position: "bottom",
      },

    },

  };


  // ====================================================
  // INSIGHTS
  // ====================================================

  const insights =
    useMemo(
      () => {

        const result = [];


        if (
          categoryData.length > 0
        ) {

          const [
            topCategory,
            topCategoryCount
          ] =
            categoryData[0];


          result.push(
            `The most common category is ${topCategory} with ${topCategoryCount} records.`
          );

        }


        if (
          cityData.length > 0
        ) {

          const [
            topCity,
            topCityCount
          ] =
            cityData[0];


          result.push(
            `${topCity} has the highest number of records with ${topCityCount} orders.`
          );

        }


        if (
          totalRevenue !== null
        ) {

          const averageRevenue =
            totalRows > 0
              ? totalRevenue /
                totalRows
              : 0;


          result.push(
            `Total revenue is ${totalRevenue.toLocaleString()} with an average value of ${averageRevenue.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })} per record.`
          );

        }


        if (
          totalQuantity !== null
        ) {

          result.push(
            `The dataset contains a total quantity of ${totalQuantity.toLocaleString()}.`
          );

        }


        if (
          missingValues === 0
        ) {

          result.push(
            "The dataset contains no missing values."
          );

        } else {

          result.push(
            `${missingValues} missing value(s) require attention.`
          );

        }


        if (
          duplicateRows === 0
        ) {

          result.push(
            "No duplicate records were detected."
          );

        } else {

          result.push(
            `${duplicateRows} duplicate record(s) were detected.`
          );

        }


        return result;

      },
      [
        categoryData,
        cityData,
        totalRevenue,
        totalQuantity,
        totalRows,
        missingValues,
        duplicateRows
      ]
    );


  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {

    return (
      <div className="analytics-loading">

        <FiRefreshCw
          className="analytics-loading-icon"
        />

        <h2>
          Generating analysis...
        </h2>

        <p>
          Preparing insights from your dataset.
        </p>

      </div>
    );

  }


  // ====================================================
  // NO DATA
  // ====================================================

  if (
    !dataset ||
    rows.length === 0
  ) {

    return (
      <div className="analytics-empty">

        <FiDatabase
          size={50}
        />

        <h2>
          No Dataset Available
        </h2>

        <p>
          Upload a CSV, JSON or XML file
          to generate your Power BI-style
          analysis dashboard.
        </p>

        <Link
          to="/upload"
          className="analytics-primary-btn"
        >
          <FiUpload />

          Upload Data
        </Link>

      </div>
    );

  }


  // ====================================================
  // MAIN DASHBOARD
  // ====================================================

  return (

    <div className="analytics-page">

      {/* ================================================
          HEADER
      ================================================= */}

      <div className="analytics-header">

        <div>

          <div className="analytics-title-row">

            <FiActivity />

            <h1>
              Analytics Dashboard
            </h1>

          </div>

          <p>
            Interactive analysis generated
            from your uploaded dataset
          </p>

        </div>


        <div className="analytics-actions">

          <Link
            to="/upload"
            className="analytics-upload-btn"
          >
            <FiUpload />

            Upload New Data
          </Link>


          <button
            className="analytics-download-btn"
            onClick={
              downloadFinalAnalysisReport
            }
          >
            <FiDownload />

            Download Final Report
          </button>


          <button
            className="analytics-refresh-btn"
            onClick={
              loadDataset
            }
            title="Refresh analysis"
          >
            <FiRefreshCw />

          </button>

        </div>

      </div>


      {/* ================================================
          DATA INFO
      ================================================= */}

      <div className="analytics-data-info">

        <span>
          <FiDatabase />

          {totalFiles} file(s)
        </span>


        <span>
          <FiColumns />

          {totalColumns} columns
        </span>


        <span>
          <FiHash />

          {totalRows.toLocaleString()} records
        </span>

      </div>


      {/* ================================================
          KPI CARDS
      ================================================= */}

      <div className="analytics-kpi-grid">


        <div className="analytics-kpi-card">

          <div className="analytics-kpi-icon blue">
            <FiDatabase />
          </div>

          <div>

            <span>
              Total Records
            </span>

            <strong>
              {totalRows.toLocaleString()}
            </strong>

          </div>

        </div>


        <div className="analytics-kpi-card">

          <div className="analytics-kpi-icon purple">
            <FiColumns />
          </div>

          <div>

            <span>
              Total Columns
            </span>

            <strong>
              {totalColumns}
            </strong>

          </div>

        </div>


        <div className="analytics-kpi-card">

          <div className="analytics-kpi-icon green">
            <FiTrendingUp />
          </div>

          <div>

            <span>
              {detected.revenue
                ? "Total Revenue"
                : "Numeric Columns"}
            </span>

            <strong>

              {totalRevenue !== null
                ? totalRevenue.toLocaleString(
                    undefined,
                    {
                      maximumFractionDigits: 2,
                    }
                  )
                : numericColumns.length}

            </strong>

          </div>

        </div>


        <div className="analytics-kpi-card">

          <div className="analytics-kpi-icon orange">
            <FiShoppingBag />
          </div>

          <div>

            <span>
              {detected.quantity
                ? "Total Quantity"
                : "Categories"}
            </span>

            <strong>

              {totalQuantity !== null
                ? totalQuantity.toLocaleString()
                : categoryData.length}

            </strong>

          </div>

        </div>

      </div>


      {/* ================================================
          MAIN CHARTS
      ================================================= */}

      <div className="analytics-chart-grid">


        {/* TREND */}

        {dateData.length > 0 && (

          <div className="analytics-chart-card large">

            <div className="analytics-card-header">

              <div>

                <h2>
                  Trend Analysis
                </h2>

                <p>
                  Records over time
                </p>

              </div>

              <FiTrendingUp />

            </div>


            <div className="analytics-chart-container">

              <Line
                data={trendChart}
                options={lineOptions}
              />

            </div>

          </div>

        )}


        {/* CATEGORY */}

        {categoryData.length > 0 && (

          <div className="analytics-chart-card">

            <div className="analytics-card-header">

              <div>

                <h2>
                  Category Distribution
                </h2>

                <p>
                  Top categories
                </p>

              </div>

              <FiShoppingBag />

            </div>


            <div className="analytics-chart-container">

              <Bar
                data={categoryChart}
                options={barOptions}
              />

            </div>

          </div>

        )}


        {/* DOUGHNUT */}

        {categoryData.length > 0 && (

          <div className="analytics-chart-card">

            <div className="analytics-card-header">

              <div>

                <h2>
                  Category Share
                </h2>

                <p>
                  Distribution of records
                </p>

              </div>

            </div>


            <div className="analytics-doughnut-container">

              <Doughnut
                data={doughnutChart}
                options={doughnutOptions}
              />

            </div>

          </div>

        )}


        {/* CITY */}

        {cityData.length > 0 && (

          <div className="analytics-chart-card">

            <div className="analytics-card-header">

              <div>

                <h2>
                  Orders by Location
                </h2>

                <p>
                  Top cities
                </p>

              </div>

              <FiMapPin />

            </div>


            <div className="analytics-chart-container">

              <Bar
                data={cityChart}
                options={barOptions}
              />

            </div>

          </div>

        )}


        {/* PRODUCTS */}

        {productData.length > 0 && (

          <div className="analytics-chart-card">

            <div className="analytics-card-header">

              <div>

                <h2>
                  Top Products
                </h2>

                <p>
                  Most frequently appearing products
                </p>

              </div>

              <FiShoppingBag />

            </div>


            <div className="analytics-ranking-list">

              {productData.map(
                (
                  [product, count],
                  index
                ) => (

                  <div
                    className="analytics-ranking-item"
                    key={product}
                  >

                    <span className="ranking-number">
                      {index + 1}
                    </span>

                    <span className="ranking-name">
                      {product}
                    </span>

                    <strong>
                      {count}
                    </strong>

                  </div>

                )
              )}

            </div>

          </div>

        )}

      </div>


      {/* ================================================
          BUSINESS METRICS
      ================================================= */}

      <div className="analytics-section">

        <div className="analytics-section-title">

          <div>

            <h2>
              Business Overview
            </h2>

            <p>
              Automatically calculated metrics
              from your dataset
            </p>

          </div>

        </div>


        <div className="analytics-business-grid">


          <div className="analytics-business-card">

            <span>
              Revenue Column
            </span>

            <strong>
              {detected.revenue || "Not detected"}
            </strong>

          </div>


          <div className="analytics-business-card">

            <span>
              Quantity Column
            </span>

            <strong>
              {detected.quantity || "Not detected"}
            </strong>

          </div>


          <div className="analytics-business-card">

            <span>
              Category Column
            </span>

            <strong>
              {detected.category || "Not detected"}
            </strong>

          </div>


          <div className="analytics-business-card">

            <span>
              Date Column
            </span>

            <strong>
              {detected.date || "Not detected"}
            </strong>

          </div>

        </div>

      </div>


      {/* ================================================
          DATA QUALITY
      ================================================= */}

      <div className="analytics-section">

        <div className="analytics-section-title">

          <div>

            <h2>
              Data Quality
            </h2>

            <p>
              Quality checks performed on
              the uploaded dataset
            </p>

          </div>

        </div>


        <div className="analytics-quality-grid">


          <div className="analytics-quality-card">

            <div className="quality-icon green">
              <FiCheckCircle />
            </div>

            <div>

              <span>
                Missing Values
              </span>

              <strong>
                {missingValues.toLocaleString()}
              </strong>

              <small>
                {missingValues === 0
                  ? "Dataset is complete"
                  : "Values require attention"}
              </small>

            </div>

          </div>


          <div className="analytics-quality-card">

            <div className="quality-icon orange">
              <FiAlertTriangle />
            </div>

            <div>

              <span>
                Duplicate Rows
              </span>

              <strong>
                {duplicateRows.toLocaleString()}
              </strong>

              <small>
                {duplicateRows === 0
                  ? "No duplicates detected"
                  : "Duplicate records found"}
              </small>

            </div>

          </div>


          <div className="analytics-quality-card">

            <div className="quality-icon blue">
              <FiHash />
            </div>

            <div>

              <span>
                Numeric Columns
              </span>

              <strong>
                {numericColumns.length}
              </strong>

              <small>
                Columns suitable for calculations
              </small>

            </div>

          </div>

        </div>

      </div>


      {/* ================================================
          INSIGHTS
      ================================================= */}

      <div className="analytics-insights-card">

        <div className="analytics-insights-header">

          <FiActivity />

          <div>

            <h2>
              Key Insights
            </h2>

            <p>
              Automatically generated from
              your uploaded data
            </p>

          </div>

        </div>


        <div className="analytics-insights-list">

          {insights.map(
            (
              insight,
              index
            ) => (

              <div
                className="analytics-insight"
                key={index}
              >

                <span>
                  {index + 1}
                </span>

                <p>
                  {insight}
                </p>

              </div>

            )
          )}

        </div>

      </div>


      {/* ================================================
          FINAL REPORT
      ================================================= */}

      <div className="analytics-report-card">

        <div>

          <h2>
            Final Analysis Report
          </h2>

          <p>
            Download a complete PDF report
            containing the analysis, charts,
            metrics and insights generated
            from this dataset.
          </p>

        </div>


        <button
          className="analytics-report-button"
          onClick={
            downloadFinalAnalysisReport
          }
        >

          <FiDownload />

          Download Final Report

        </button>

      </div>

    </div>

  );

};


export default Analytics;
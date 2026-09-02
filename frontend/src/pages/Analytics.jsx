// import { useEffect, useMemo, useState } from "react";
// import {
//   Bar,
//   Line,
//   Doughnut
// } from "react-chartjs-2";


// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   ArcElement,
//   Tooltip,
//   Legend
// } from "chart.js";

// import {
//   FiDatabase,
//   FiColumns,
//   FiHash,
//   FiAlertTriangle,
//   FiRefreshCw,
//   FiUpload,
//   FiShoppingBag,
//   FiMapPin,
//   FiTrendingUp
// } from "react-icons/fi";

// import { Link } from "react-router-dom";

// import "./Analytics.css";
// const chartColors = [
//   "#4F46E5",
//   "#06B6D4",
//   "#10B981",
//   "#F59E0B",
//   "#EF4444",
//   "#8B5CF6",
//   "#EC4899",
//   "#14B8A6",
// ];


// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   ArcElement,
//   Tooltip,
//   Legend
// );



// function Analytics() {

//   const [dataset, setDataset] = useState(null);


//   /* =========================================
//      LOAD DATASET
//   ========================================= */

//   const loadDataset = () => {

//     try {

//       const saved =
//         sessionStorage.getItem("dataset");

//       if (!saved) {
//         setDataset(null);
//         return;
//       }

//       const parsed =
//         JSON.parse(saved);

//       console.log(
//         "Analytics dataset:",
//         parsed
//       );

//       setDataset(parsed);

//     } catch (error) {

//       console.error(
//         "Analytics dataset error:",
//         error
//       );

//       setDataset(null);
//     }
//   };


//   useEffect(() => {

//     loadDataset();

//     const handleStorage = () => {
//       loadDataset();
//     };

//     window.addEventListener(
//       "storage",
//       handleStorage
//     );

//     return () => {
//       window.removeEventListener(
//         "storage",
//         handleStorage
//       );
//     };

//   }, []);


//   /* =========================================
//      DATA
//   ========================================= */

//   const combinedData =
//     dataset?.combined_data || {};

//   const rows =
//     Array.isArray(combinedData.rows)
//       ? combinedData.rows
//       : [];

//   const columns =
//     Array.isArray(combinedData.columns)
//       ? combinedData.columns
//       : [];

//   const uploadedFiles =
//     Array.isArray(dataset?.files)
//       ? dataset.files
//       : [];


//   /* =========================================
//      NUMERIC COLUMNS
//   ========================================= */

//   const numericColumns = useMemo(() => {

//     if (!rows.length) return [];

//     return columns.filter((column) => {

//       const values = rows
//         .map((row) => row[column])
//         .filter(
//           (value) =>
//             value !== null &&
//             value !== undefined &&
//             value !== ""
//         );

//       if (!values.length) {
//         return false;
//       }

//       const numericValues =
//         values.filter(
//           (value) =>
//             !isNaN(Number(value))
//         );

//       return (
//         numericValues.length /
//           values.length >=
//         0.7
//       );

//     });

//   }, [rows, columns]);


//   /* =========================================
//      CATEGORY COLUMNS
//   ========================================= */

//   const categoryColumns = useMemo(() => {

//     if (!rows.length) return [];

//     return columns.filter((column) => {

//       const values = rows
//         .map((row) => row[column])
//         .filter(
//           (value) =>
//             value !== null &&
//             value !== undefined &&
//             value !== ""
//         );

//       if (!values.length) {
//         return false;
//       }

//       const uniqueValues =
//         new Set(
//           values.map((value) =>
//             String(value)
//           )
//         );

//       return (
//         uniqueValues.size > 1 &&
//         uniqueValues.size <=
//           Math.min(
//             20,
//             values.length
//           )
//       );

//     });

//   }, [rows, columns]);


//   /* =========================================
//      FIND SALES COLUMN
//   ========================================= */

//   const salesColumn = useMemo(() => {

//     const names = [
//       "sales",
//       "sale",
//       "revenue",
//       "amount",
//       "total",
//       "price",
//       "income",
//       "profit",
//       "order_value",
//       "order value",
//       "total_amount",
//       "total amount"
//     ];

//     return numericColumns.find(
//       (column) => {

//         const normalized =
//           column
//             .toLowerCase()
//             .replace(/[_-]/g, " ");

//         return names.some(
//           (name) =>
//             normalized.includes(name)
//         );
//       }
//     );

//   }, [numericColumns]);


//   /* =========================================
//      FIND QUANTITY COLUMN
//   ========================================= */

//   const quantityColumn = useMemo(() => {

//     const names = [
//       "quantity",
//       "qty",
//       "units",
//       "items",
//       "count"
//     ];

//     return numericColumns.find(
//       (column) => {

//         const normalized =
//           column
//             .toLowerCase()
//             .replace(/[_-]/g, " ");

//         return names.some(
//           (name) =>
//             normalized.includes(name)
//         );
//       }
//     );

//   }, [numericColumns]);


//   /* =========================================
//      FIND CATEGORY COLUMN
//   ========================================= */

//   const categoryColumn = useMemo(() => {

//     const preferred = categoryColumns.find(
//       (column) => {

//         const name =
//           column.toLowerCase();

//         return (
//           name.includes("category") ||
//           name.includes("product") ||
//           name.includes("type") ||
//           name.includes("status") ||
//           name.includes("region") ||
//           name.includes("country")
//         );

//       }
//     );

//     return (
//       preferred ||
//       categoryColumns[0] ||
//       null
//     );

//   }, [categoryColumns]);


//   /* =========================================
//      FIND CITY COLUMN
//   ========================================= */

//   const cityColumn = useMemo(() => {

//     return columns.find(
//       (column) =>
//         column
//           .toLowerCase()
//           .includes("city")
//     );

//   }, [columns]);


//   /* =========================================
//      NUMERIC VALUE COUNT
//   ========================================= */

//   const numericValueCount = useMemo(() => {

//     let count = 0;

//     rows.forEach((row) => {

//       numericColumns.forEach(
//         (column) => {

//           const value =
//             row[column];

//           if (
//             value !== null &&
//             value !== undefined &&
//             value !== "" &&
//             !isNaN(Number(value))
//           ) {
//             count++;
//           }

//         }
//       );

//     });

//     return count;

//   }, [rows, numericColumns]);


//   /* =========================================
//      MISSING VALUES
//   ========================================= */

//   const missingValues = useMemo(() => {

//     let count = 0;

//     rows.forEach((row) => {

//       columns.forEach((column) => {

//         const value =
//           row[column];

//         if (
//           value === null ||
//           value === undefined ||
//           String(value).trim() === ""
//         ) {
//           count++;
//         }

//       });

//     });

//     return count;

//   }, [rows, columns]);


//   /* =========================================
//      DUPLICATES
//   ========================================= */

//   const duplicateRows = useMemo(() => {

//     const seen = new Set();

//     let duplicates = 0;

//     rows.forEach((row) => {

//       const key =
//         JSON.stringify(row);

//       if (seen.has(key)) {
//         duplicates++;
//       } else {
//         seen.add(key);
//       }

//     });

//     return duplicates;

//   }, [rows]);


//   /* =========================================
//      TOTAL NUMERIC SUM
//   ========================================= */

//   const totalNumericValue =
//     useMemo(() => {

//       let total = 0;

//       rows.forEach((row) => {

//         numericColumns.forEach(
//           (column) => {

//             const value =
//               Number(row[column]);

//             if (!isNaN(value)) {
//               total += value;
//             }

//           }
//         );

//       });

//       return total;

//     }, [rows, numericColumns]);


//   /* =========================================
//      TOTAL SALES
//   ========================================= */

//   const totalSales =
//     useMemo(() => {

//       if (!salesColumn) {
//         return null;
//       }

//       return rows.reduce(
//         (sum, row) => {

//           const value =
//             Number(row[salesColumn]);

//           return (
//             sum +
//             (isNaN(value)
//               ? 0
//               : value)
//           );

//         },
//         0
//       );

//     }, [rows, salesColumn]);


//   /* =========================================
//      TOTAL QUANTITY
//   ========================================= */

//   const totalQuantity =
//     useMemo(() => {

//       if (!quantityColumn) {
//         return null;
//       }

//       return rows.reduce(
//         (sum, row) => {

//           const value =
//             Number(row[quantityColumn]);

//           return (
//             sum +
//             (isNaN(value)
//               ? 0
//               : value)
//           );

//         },
//         0
//       );

//     }, [rows, quantityColumn]);


//   /* =========================================
//      CATEGORY DATA
//   ========================================= */

//   const categoryData =
//     useMemo(() => {

//       if (
//         !categoryColumn ||
//         !rows.length
//       ) {
//         return null;
//       }

//       const counts = {};

//       rows.forEach((row) => {

//         const value =
//           row[categoryColumn];

//         if (
//           value !== null &&
//           value !== undefined &&
//           String(value).trim() !== ""
//         ) {

//           const key =
//             String(value);

//           counts[key] =
//             (counts[key] || 0) + 1;

//         }

//       });

//       const sorted =
//         Object.entries(counts)
//           .sort(
//             (a, b) =>
//               b[1] - a[1]
//           )
//           .slice(0, 10);

//       return {

//         column:
//           categoryColumn,

//         labels:
//           sorted.map(
//             ([key]) => key
//           ),

//         values:
//           sorted.map(
//             ([, value]) =>
//               value
//           )

//       };

//     }, [
//       categoryColumn,
//       rows
//     ]);


//   /* =========================================
//      CITY DATA
//   ========================================= */

//   const cityData =
//     useMemo(() => {

//       if (
//         !cityColumn ||
//         !rows.length
//       ) {
//         return null;
//       }

//       const counts = {};

//       rows.forEach((row) => {

//         const value =
//           row[cityColumn];

//         if (
//           value !== null &&
//           value !== undefined &&
//           String(value).trim() !== ""
//         ) {

//           const key =
//             String(value);

//           counts[key] =
//             (counts[key] || 0) + 1;

//         }

//       });

//       const sorted =
//         Object.entries(counts)
//           .sort(
//             (a, b) =>
//               b[1] - a[1]
//           )
//           .slice(0, 10);

//       return {

//         labels:
//           sorted.map(
//             ([key]) => key
//           ),

//         values:
//           sorted.map(
//             ([, value]) =>
//               value
//           )

//       };

//     }, [
//       cityColumn,
//       rows
//     ]);


//   /* =========================================
//      CATEGORY BAR CHART
//   ========================================= */

// const categoryChart = categoryData
//   ? {
//       labels: categoryData.labels,

//       datasets: [
//         {
//           label: "Orders",

//           data: categoryData.values,

//           backgroundColor: chartColors,

//           borderRadius: 8,

//           borderSkipped: false,
//         },
//       ],
//     }
//   : null;

//   /* =========================================
//      DOUGHNUT CHART
//   ========================================= */

//  const doughnutChart = categoryData
//   ? {
//       labels: categoryData.labels,

//       datasets: [
//         {
//           data: categoryData.values,

//           backgroundColor: chartColors,

//           borderColor: "#ffffff",

//           borderWidth: 3,

//           hoverOffset: 10,
//         },
//       ],
//     }
//   : null;


//   /* =========================================
//      CITY CHART
//   ========================================= */

//   const cityChart =
//     cityData
//       ? {
//           labels:
//             cityData.labels,

//           datasets: [
//             {
//               label:
//                 "Orders",

//               data:
//                 cityData.values,

//               borderWidth: 1
//             }
//           ]
//         }
//       : null;


//   /* =========================================
//      NUMERIC TREND
//   ========================================= */

//   const numericChart =
//     useMemo(() => {

//       if (
//         !numericColumns.length ||
//         !rows.length
//       ) {
//         return null;
//       }

//       const column =
//         salesColumn ||
//         numericColumns[0];

//       const values =
//         rows
//           .map((row) =>
//             Number(row[column])
//           )
//           .filter(
//             (value) =>
//               !isNaN(value)
//           )
//           .slice(0, 30);

//           return {
//         labels: values.map(
//           (_, index) => `Row ${index + 1}`
//         ),

//         datasets: [
//           {
//             label: column,
//             data: values,

//             borderColor: "#4F46E5",
//             backgroundColor: "rgba(79, 70, 229, 0.12)",

//             fill: true,
//             tension: 0.4,

//             pointRadius: 4,
//             pointHoverRadius: 7,

//             borderWidth: 3,
//           },
//         ],
//       };
//     }, [
//       numericColumns,
//       rows,
//       salesColumn
//     ]);


//   /* =========================================
//      NO DATA
//   ========================================= */

//   if (!dataset || !rows.length) {

//     return (

//       <div className="analytics-page">

//         <div className="analytics-empty">

//           <div className="analytics-empty-icon">
//             <FiDatabase />
//           </div>

//           <h1>
//             No Dataset Uploaded
//           </h1>

//           <p>
//             Upload a CSV, JSON or XML
//             file to generate your
//             analytics dashboard.
//           </p>

//           <Link
//             to="/upload"
//             className="analytics-primary-btn"
//           >
//             <FiUpload />
//             Upload Dataset
//           </Link>

//         </div>

//       </div>

//     );

//   }




//   return (

//     <div className="analytics-page">

    

//      <header className="analytics-header">

//         <div>

//           <h1>
//             Analytics Dashboard
//           </h1>

//           <p>
//             Analyze your uploaded
//             dataset
//           </p>

//         </div>

//         <div className="analytics-actions">

//           <Link
//             to="/upload"
//             className="analytics-primary-btn"
//           >
//             <FiUpload />
//             Upload New Data
//           </Link>

//           <button
//             className="analytics-refresh-btn"
//             onClick={loadDataset}
//             title="Refresh"
//           >
//             <FiRefreshCw />
//           </button>

//         </div>

//       </header>


//       {/* DATASET */}

//       <section className="dataset-card">

//         <div>

//           <h2>
//             Current Dataset
//           </h2>

//           <p>
//             {uploadedFiles.length}
//             {" "}
//             file(s) uploaded
//           </p>

//         </div>

//         <div className="file-list">

//           {uploadedFiles.map(
//             (file, index) => (

//               <span
//                 key={index}
//                 className="file-badge"
//               >
//                 <FiFileIcon />
//                 {file.filename ||
//                   file.name ||
//                   `File ${index + 1}`}
//               </span>

//             )
//           )}

//         </div>

//       </section>


//       {/* KPI */}

//       <section className="analytics-kpi-grid">

//         <div className="analytics-card">

//           <div className="card-content">

//             <span>
//               Total Records
//             </span>

//             <strong>
//               {rows.length.toLocaleString()}
//             </strong>

//           </div>

//           <div className="card-icon blue">
//             <FiDatabase />
//           </div>

//         </div>


//         <div className="analytics-card">

//           <div className="card-content">

//             <span>
//               Columns
//             </span>

//             <strong>
//               {columns.length}
//             </strong>

//           </div>

//           <div className="card-icon purple">
//             <FiColumns />
//           </div>

//         </div>


//         <div className="analytics-card">

//           <div className="card-content">

//             <span>
//               Numeric Values
//             </span>

//             <strong>
//               {numericValueCount.toLocaleString()}
//             </strong>

//           </div>

//           <div className="card-icon green">
//             <FiHash />
//           </div>

//         </div>


//         <div className="analytics-card">

//           <div className="card-content">

//             <span>
//               Missing Values
//             </span>

//             <strong>
//               {missingValues.toLocaleString()}
//             </strong>

//           </div>

//           <div className="card-icon red">
//             <FiAlertTriangle />
//           </div>

//         </div>

//       </section>


//       {/* BUSINESS METRICS */}

//       <section className="analytics-kpi-grid">

//         <div className="analytics-card">

//           <div className="card-content">

//             <span>
//               Total Sales
//             </span>

//             <strong>

//               {totalSales !== null
//                 ? `₹${totalSales.toLocaleString(
//                     undefined,
//                     {
//                       maximumFractionDigits: 2
//                     }
//                   )}`
//                 : "N/A"}

//             </strong>

//             <small>
//               {salesColumn ||
//                 "Sales column not found"}
//             </small>

//           </div>

//           <div className="card-icon orange">
//             <FiTrendingUp />
//           </div>

//         </div>


//         <div className="analytics-card">

//           <div className="card-content">

//             <span>
//               Total Quantity
//             </span>

//             <strong>

//               {totalQuantity !== null
//                 ? totalQuantity.toLocaleString()
//                 : "N/A"}

//             </strong>

//             <small>
//               {quantityColumn ||
//                 "Quantity column not found"}
//             </small>

//           </div>

//           <div className="card-icon green">
//             <FiShoppingBag />
//           </div>

//         </div>


//         <div className="analytics-card">

//           <div className="card-content">

//             <span>
//               Numeric Data Sum
//             </span>

//             <strong>
//               {totalNumericValue.toLocaleString(
//                 undefined,
//                 {
//                   maximumFractionDigits: 2
//                 }
//               )}
//             </strong>

//           </div>

//           <div className="card-icon blue">
//             <FiHash />
//           </div>

//         </div>


//         <div className="analytics-card">

//           <div className="card-content">

//             <span>
//               Duplicate Records
//             </span>

//             <strong>
//               {duplicateRows}
//             </strong>

//           </div>

//           <div className="card-icon red">
//             <FiAlertTriangle />
//           </div>

//         </div>

//       </section>


//       {/* CHARTS */}

//       <section className="chart-grid">

//         {/* CATEGORY */}

//         {categoryChart && (

//           <div className="chart-card">

//             <div className="chart-header">

//               <div>

//                 <h2>
//                   Category Distribution
//                 </h2>

//                 <p>
//                   Records by{" "}
//                   <strong>
//                     {categoryData.column}
//                   </strong>
//                 </p>

//               </div>

//             </div>

//             <div className="chart-area">

//           <Bar
//   data={categoryChart}
//   options={{
//     responsive: true,
//     maintainAspectRatio: false,
//        animation: {
//       duration: 1800,
//       easing: "easeOutQuart",
//     },
//     plugins: {
//       legend: {
//         display: false,
//       },

//       tooltip: {
//         backgroundColor: "#0f172a",
//         titleColor: "#ffffff",
//         bodyColor: "#e2e8f0",
//         padding: 12,
//         cornerRadius: 8,
//       },
//     },

//     scales: {
//       x: {
//         grid: {
//           display: false,
//         },

//         ticks: {
//           color: "#64748b",
//         },
//       },

//       y: {
//         beginAtZero: true,

//         grid: {
//           color: "#e2e8f0",
//         },

//         ticks: {
//           color: "#64748b",
//         },
//       },
//     },
//   }}
// />
//             </div>

//           </div>

//         )}


//         {/* DOUGHNUT */}

//         {doughnutChart && (

//           <div className="chart-card">

//             <div className="chart-header">

//               <div>

//                 <h2>
//                   Data Distribution
//                 </h2>

//                 <p>
//                   Based on{" "}
//                   <strong>
//                     {categoryData.column}
//                   </strong>
//                 </p>

//               </div>

//             </div>

//            <Doughnut
//   data={doughnutChart}
//   options={{
//     responsive: true,

//     maintainAspectRatio: false,

//     cutout: "65%",
//  animation: {
//       animateRotate: true,
//       animateScale: true,
//       duration: 1800,
//       easing: "easeOutQuart",
//     },
//     plugins: {
//       legend: {
//         position: "bottom",

//         labels: {
//           usePointStyle: true,

//           padding: 18,

//           font: {
//             size: 12,
//           },
//         },
//       },

//       tooltip: {
//         backgroundColor: "#0f172a",

//         titleColor: "#ffffff",

//         bodyColor: "#e2e8f0",

//         padding: 12,

//         cornerRadius: 8,
//       },
//     },
//   }}
// />

//           </div>

//         )}


//         {/* CITY */}

//         {cityChart && (

//           <div className="chart-card">

//             <div className="chart-header">

//               <div>

//                 <h2>
//                   Orders by City
//                 </h2>

//                 <p>
//                   Top performing cities
//                 </p>

//               </div>

//               <FiMapPin />

//             </div>

//             <div className="chart-area">

//               <Bar
//                 data={cityChart}
//                 options={{
//                   responsive: true,
//                   maintainAspectRatio: false,
//                   plugins: {
//                     legend: {
//                       display: false
//                     }
//                   }
//                 }}
//               />

//             </div>

//           </div>

//         )}


//         {/* NUMERIC TREND */}

//         {numericChart && (

//           <div className="chart-card">

//             <div className="chart-header">

//               <div>

//                 <h2>
//                   Numeric Data Trend
//                 </h2>

//                 <p>
//                   Using{" "}
//                   <strong>
//                     {salesColumn ||
//                       numericColumns[0]}
//                   </strong>
//                 </p>

//               </div>

//             </div>

//             <div className="chart-area">

//              <Line
//   data={numericChart}
//   options={{
//     responsive: true,

//     maintainAspectRatio: false,
//      animation: {
//       duration: 2000,
//       easing: "easeInOutQuart",
//     },

//     plugins: {
//       legend: {
//         position: "bottom",

//         labels: {
//           usePointStyle: true,

//           padding: 18,
//         },
//       },

//       tooltip: {
//         backgroundColor: "#0f172a",

//         titleColor: "#ffffff",

//         bodyColor: "#e2e8f0",

//         padding: 12,

//         cornerRadius: 8,
//       },
//     },

//     scales: {
//       x: {
//         grid: {
//           display: false,
//         },

//         ticks: {
//           color: "#64748b",
//         },
//       },

//       y: {
//         beginAtZero: true,

//         grid: {
//           color: "#e2e8f0",
//         },

//         ticks: {
//           color: "#64748b",
//         },
//       },
//     },
//   }}
// />

//             </div>

//           </div>

//         )}

//       </section>


//       {/* DATA PREVIEW */}
// {/* DATA QUALITY OVERVIEW */}

// <section className="analytics-data-summary">

//   <div className="summary-header">

//     <div>
//       <h2>Data Quality Overview</h2>

//       <p>
//         Quick summary of your uploaded dataset
//       </p>
//     </div>

//     <span className="quality-badge">
//       ✓ Dataset Analyzed
//     </span>

//   </div>


//   <div className="quality-grid">

//     {/* RECORDS */}

//     <div className="quality-item">

//       <span className="quality-icon blue">
//         📄
//       </span>

//       <div>
//         <small>Total Records</small>

//         <strong>
//           {rows.length.toLocaleString()}
//         </strong>
//       </div>

//     </div>


//     {/* COLUMNS */}

//     <div className="quality-item">

//       <span className="quality-icon purple">
//         🔢
//       </span>

//       <div>
//         <small>Total Columns</small>

//         <strong>
//           {columns.length}
//         </strong>
//       </div>

//     </div>


//     {/* MISSING */}

//     <div className="quality-item">

//       <span className="quality-icon orange">
//         ⚠️
//       </span>

//       <div>
//         <small>Missing Values</small>

//         <strong>
//           {missingValues.toLocaleString()}
//         </strong>
//       </div>

//     </div>


//     {/* DUPLICATES */}

//     <div className="quality-item">

//       <span className="quality-icon red">
//         ♻️
//       </span>

//       <div>
//         <small>Duplicate Rows</small>

//         <strong>
//           {duplicateRows.toLocaleString()}
//         </strong>
//       </div>

//     </div>

//   </div>

// </section>
      
//     </div>

//   );
// }


// /* Small icon component */

// function FiFileIcon() {
//   return (
//     <span className="file-icon">
//       📄
//     </span>
//   );
// }


// export default Analytics;

import React, { useEffect, useRef, useState } from "react";
import {
  FiDownload,
  FiDatabase,
  FiFileText,
  FiColumns,
  FiAlertCircle,
  FiCopy,
  FiBarChart2,
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
  Title,
} from "chart.js";

import { Bar, Line, Doughnut } from "react-chartjs-2";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";


// ======================================================
// REGISTER CHART.JS
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
  Title
);


// ======================================================
// ANALYTICS COMPONENT
// ======================================================

const Analytics = () => {

  const [dataset, setDataset] = useState(null);

  // Used to capture charts for PDF
  const chartsRef = useRef(null);


  // ====================================================
  // LOAD DATASET
  // ====================================================

  useEffect(() => {

    const savedDataset =
      sessionStorage.getItem("dataset");

    if (!savedDataset) {
      return;
    }

    try {

      const parsedData =
        JSON.parse(savedDataset);

      setDataset(parsedData);

    } catch (error) {

      console.error(
        "Error reading dataset:",
        error
      );

    }

  }, []);


  // ====================================================
  // DATA
  // ====================================================

  const combinedData =
    dataset?.combined_data || {};

  const rows =
    combinedData.rows || [];

  const columns =
    combinedData.columns || [];

  const summary =
    dataset?.summary || {};

  const files =
    dataset?.files || [];


  // ====================================================
  // BASIC STATISTICS
  // ====================================================

  const totalRows =
    summary.total_rows !== undefined
      ? summary.total_rows
      : rows.length;

  const totalColumns =
    summary.total_columns !== undefined
      ? summary.total_columns
      : columns.length;

  const totalFiles =
    summary.total_files !== undefined
      ? summary.total_files
      : files.length;


  // ====================================================
  // FIND COLUMN
  // ====================================================

  const findColumn = (keywords) => {

    return columns.find((column) => {

      const name =
        String(column).toLowerCase();

      return keywords.some((keyword) =>
        name.includes(keyword)
      );

    });

  };


  // ====================================================
  // DETECT IMPORTANT COLUMNS
  // ====================================================

  const salesColumn = findColumn([
    "sales",
    "sale",
    "revenue",
    "amount",
    "price",
    "total",
    "income",
    "value",
  ]);


  const quantityColumn = findColumn([
    "quantity",
    "qty",
    "units",
  ]);


  const categoryColumn = findColumn([
    "category",
    "product",
    "type",
    "item",
    "department",
  ]);


  const dateColumn = findColumn([
    "date",
    "time",
    "month",
    "year",
    "created",
    "order_date",
  ]);


  // ====================================================
  // NUMERIC COLUMNS
  // ====================================================

  const numericColumns = columns.filter(
    (column) => {

      const values = rows
        .map((row) => row[column])
        .filter(
          (value) =>
            value !== null &&
            value !== undefined &&
            value !== ""
        );

      if (values.length === 0) {
        return false;
      }

      return values.every(
        (value) =>
          !isNaN(Number(value))
      );

    }
  );


  // ====================================================
  // MISSING VALUES
  // ====================================================

  let missingValues = 0;

  rows.forEach((row) => {

    columns.forEach((column) => {

      const value =
        row[column];

      if (
        value === null ||
        value === undefined ||
        value === ""
      ) {

        missingValues++;

      }

    });

  });


  // ====================================================
  // DUPLICATE ROWS
  // ====================================================

  const uniqueRows =
    new Set(
      rows.map((row) =>
        JSON.stringify(row)
      )
    );

  const duplicateRows =
    rows.length -
    uniqueRows.size;


  // ====================================================
  // TOTAL SALES
  // ====================================================

  let totalSales = 0;

  if (salesColumn) {

    totalSales =
      rows.reduce(
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

  }


  // ====================================================
  // TOTAL QUANTITY
  // ====================================================

  let totalQuantity = 0;

  if (quantityColumn) {

    totalQuantity =
      rows.reduce(
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

  }


  // ====================================================
  // AVERAGE SALES
  // ====================================================

  const averageSales =
    salesColumn && rows.length > 0
      ? totalSales / rows.length
      : 0;


  // ====================================================
  // NUMERIC STATISTICS
  // ====================================================

  const numericStatistics =
    numericColumns
      .map((column) => {

        const values =
          rows
            .map((row) =>
              Number(row[column])
            )
            .filter(
              (value) =>
                !isNaN(value)
            );

        if (values.length === 0) {
          return null;
        }

        const total =
          values.reduce(
            (sum, value) =>
              sum + value,
            0
          );

        const average =
          total / values.length;

        const minimum =
          Math.min(...values);

        const maximum =
          Math.max(...values);

        return {
          column,
          total,
          average,
          minimum,
          maximum,
        };

      })
      .filter(Boolean);


  // ====================================================
  // CATEGORY DATA
  // ====================================================

  const categoryData = {};

  if (categoryColumn) {

    rows.forEach((row) => {

      const category =
        row[categoryColumn];

      if (
        category !== null &&
        category !== undefined &&
        category !== ""
      ) {

        categoryData[category] =
          (categoryData[category] || 0) +
          1;

      }

    });

  }


  // ====================================================
  // SORT CATEGORY DATA
  // ====================================================

  const sortedCategories =
    Object.entries(categoryData)
      .sort(
        (a, b) =>
          b[1] - a[1]
      );


  // ====================================================
  // CATEGORY CHART
  // ====================================================

  const categoryChartData = {

    labels:
      sortedCategories
        .slice(0, 10)
        .map(([category]) =>
          String(category)
        ),

    datasets: [
      {
        label: "Records",

        data:
          sortedCategories
            .slice(0, 10)
            .map(([, count]) =>
              count
            ),

        borderWidth: 1,
      },
    ],

  };


  // ====================================================
  // DOUGHNUT CHART
  // ====================================================

  const doughnutChartData = {

    labels:
      sortedCategories
        .slice(0, 8)
        .map(([category]) =>
          String(category)
        ),

    datasets: [
      {
        label: "Category Share",

        data:
          sortedCategories
            .slice(0, 8)
            .map(([, count]) =>
              count
            ),

        borderWidth: 1,
      },
    ],

  };


  // ====================================================
  // DATE DATA
  // ====================================================

  const dateGroups = {};

  if (dateColumn) {

    rows.forEach((row) => {

      const rawDate =
        row[dateColumn];

      if (
        rawDate === null ||
        rawDate === undefined ||
        rawDate === ""
      ) {
        return;
      }

      const parsedDate =
        new Date(rawDate);

      if (
        !isNaN(parsedDate.getTime())
      ) {

        const label =
          parsedDate
            .toISOString()
            .slice(0, 10);

        dateGroups[label] =
          (dateGroups[label] || 0) +
          1;

      }

    });

  }


  const sortedDates =
    Object.entries(dateGroups)
      .sort(
        (a, b) =>
          new Date(a[0]) -
          new Date(b[0])
      );


  // ====================================================
  // LINE CHART
  // ====================================================

  const lineChartData = {

    labels:
      sortedDates.map(
        ([date]) => date
      ),

    datasets: [
      {
        label: "Records",

        data:
          sortedDates.map(
            ([, count]) =>
              count
          ),

        tension: 0.3,

        borderWidth: 2,

        pointRadius: 3,
      },
    ],

  };


  // ====================================================
  // CHART OPTIONS
  // ====================================================

  const chartOptions = {

    responsive: true,

    maintainAspectRatio: false,

    plugins: {

      legend: {
        position: "bottom",
      },

    },

  };


  // ====================================================
  // DOWNLOAD FINAL PDF REPORT
  // ====================================================

  const downloadReport = async () => {

    if (
      !dataset ||
      rows.length === 0
    ) {

      alert(
        "Please upload and analyze a dataset first."
      );

      return;
    }


    try {

      const doc =
        new jsPDF(
          "p",
          "mm",
          "a4"
        );


      // =================================================
      // TITLE
      // =================================================

      doc.setFontSize(22);

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        "Order Analytics",
        14,
        20
      );


      doc.setFontSize(16);

      doc.text(
        "Final Analysis Report",
        14,
        29
      );


      doc.setFontSize(9);

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.text(
        `Generated: ${new Date().toLocaleString()}`,
        14,
        36
      );


      // =================================================
      // SUMMARY TABLE
      // =================================================

      doc.setFontSize(15);

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        "Analysis Summary",
        14,
        48
      );


      autoTable(doc, {

        startY: 54,

        head: [
          [
            "Metric",
            "Value",
          ],
        ],

        body: [

          [
            "Total Files",
            totalFiles,
          ],

          [
            "Total Rows",
            totalRows,
          ],

          [
            "Total Columns",
            totalColumns,
          ],

          [
            "Numeric Columns",
            numericColumns.length,
          ],

          [
            "Missing Values",
            missingValues,
          ],

          [
            "Duplicate Rows",
            duplicateRows,
          ],

        ],

        theme: "grid",

      });


      // =================================================
      // BUSINESS METRICS
      // =================================================

      let currentY =
        doc.lastAutoTable.finalY +
        12;


      doc.setFontSize(15);

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        "Business Metrics",
        14,
        currentY
      );


      const businessRows = [];


      if (salesColumn) {

        businessRows.push([
          "Sales / Revenue Column",
          salesColumn,
        ]);

        businessRows.push([
          "Total Sales / Revenue",
          totalSales.toLocaleString(
            undefined,
            {
              maximumFractionDigits: 2,
            }
          ),
        ]);

        businessRows.push([
          "Average Sales / Revenue",
          averageSales.toLocaleString(
            undefined,
            {
              maximumFractionDigits: 2,
            }
          ),
        ]);

      }


      if (quantityColumn) {

        businessRows.push([
          "Quantity Column",
          quantityColumn,
        ]);

        businessRows.push([
          "Total Quantity",
          totalQuantity.toLocaleString(),
        ]);

      }


      if (categoryColumn) {

        businessRows.push([
          "Category Column",
          categoryColumn,
        ]);

        businessRows.push([
          "Unique Categories",
          Object.keys(
            categoryData
          ).length,
        ]);

      }


      if (dateColumn) {

        businessRows.push([
          "Date Column",
          dateColumn,
        ]);

      }


      if (businessRows.length > 0) {

        autoTable(doc, {

          startY:
            currentY + 6,

          head: [
            [
              "Metric",
              "Value",
            ],
          ],

          body:
            businessRows,

          theme: "grid",

        });

      }


      // =================================================
      // CHARTS PAGE
      // =================================================

      doc.addPage();


      doc.setFontSize(18);

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        "Visual Analysis",
        14,
        20
      );


      // -------------------------------------------------
      // CAPTURE CHARTS
      // -------------------------------------------------

      const chartElements =
        chartsRef.current?.querySelectorAll(
          ".report-chart"
        );


      if (
        chartElements &&
        chartElements.length > 0
      ) {

        let chartY = 30;


        for (
          let i = 0;
          i < chartElements.length;
          i++
        ) {

          const element =
            chartElements[i];


          const canvas =
            await html2canvas(
              element,
              {
                scale: 2,

                backgroundColor:
                  "#ffffff",
              }
            );


          const image =
            canvas.toDataURL(
              "image/png"
            );


          const imageWidth = 180;

          const imageHeight =
            (canvas.height /
              canvas.width) *
            imageWidth;


          if (
            chartY +
              imageHeight >
            280
          ) {

            doc.addPage();

            chartY = 20;

          }


          doc.addImage(
            image,
            "PNG",
            14,
            chartY,
            imageWidth,
            imageHeight
          );


          chartY +=
            imageHeight + 15;

        }

      }


      // =================================================
      // NUMERIC STATISTICS
      // =================================================

      doc.addPage();


      doc.setFontSize(17);

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        "Numeric Column Analysis",
        14,
        20
      );


      if (
        numericStatistics.length > 0
      ) {

        autoTable(doc, {

          startY: 28,

          head: [
            [
              "Column",
              "Total",
              "Average",
              "Minimum",
              "Maximum",
            ],
          ],

          body:
            numericStatistics.map(
              (item) => [

                item.column,

                item.total.toLocaleString(
                  undefined,
                  {
                    maximumFractionDigits: 2,
                  }
                ),

                item.average.toLocaleString(
                  undefined,
                  {
                    maximumFractionDigits: 2,
                  }
                ),

                item.minimum.toLocaleString(
                  undefined,
                  {
                    maximumFractionDigits: 2,
                  }
                ),

                item.maximum.toLocaleString(
                  undefined,
                  {
                    maximumFractionDigits: 2,
                  }
                ),

              ]
            ),

          theme: "grid",

          styles: {
            fontSize: 8,
          },

        });

      } else {

        doc.setFontSize(11);

        doc.text(
          "No numeric columns detected.",
          14,
          32
        );

      }


      // =================================================
      // CATEGORY ANALYSIS
      // =================================================

      if (
        sortedCategories.length > 0
      ) {

        doc.addPage();


        doc.setFontSize(17);

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.text(
          "Category Analysis",
          14,
          20
        );


        autoTable(doc, {

          startY: 28,

          head: [
            [
              "Category",
              "Records",
            ],
          ],

          body:
            sortedCategories.map(
              ([category, count]) => [
                String(category),
                count,
              ]
            ),

          theme: "grid",

        });

      }


      // =================================================
      // DATA PREVIEW
      // =================================================

      if (
        rows.length > 0 &&
        columns.length > 0
      ) {

        doc.addPage();


        doc.setFontSize(17);

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.text(
          "Analyzed Data Preview",
          14,
          20
        );


        const previewRows =
          rows
            .slice(0, 50)
            .map((row) =>
              columns.map(
                (column) => {

                  const value =
                    row[column];

                  if (
                    value === null ||
                    value === undefined
                  ) {
                    return "";
                  }

                  return String(value);

                }
              )
            );


        autoTable(doc, {

          startY: 28,

          head: [
            columns,
          ],

          body:
            previewRows,

          theme: "grid",

          styles: {
            fontSize: 6,
          },

        });

      }


      // =================================================
      // FINAL INSIGHTS
      // =================================================

      doc.addPage();


      doc.setFontSize(17);

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        "Final Analysis Insights",
        14,
        20
      );


      const insights = [];


      insights.push(
        `The dataset contains ${totalRows} records across ${totalColumns} columns.`
      );


      insights.push(
        `${totalFiles} file(s) were analyzed successfully.`
      );


      if (
        numericColumns.length > 0
      ) {

        insights.push(
          `${numericColumns.length} numeric column(s) were identified.`
        );

      }


      if (
        missingValues > 0
      ) {

        insights.push(
          `${missingValues} missing value(s) were detected.`
        );

      } else {

        insights.push(
          "No missing values were detected."
        );

      }


      if (
        duplicateRows > 0
      ) {

        insights.push(
          `${duplicateRows} duplicate row(s) were detected.`
        );

      } else {

        insights.push(
          "No duplicate rows were detected."
        );

      }


      if (salesColumn) {

        insights.push(
          `Total sales/revenue is ${totalSales.toLocaleString(
            undefined,
            {
              maximumFractionDigits: 2,
            }
          )}.`
        );

      }


      if (quantityColumn) {

        insights.push(
          `Total quantity is ${totalQuantity.toLocaleString()}.`
        );

      }


      if (categoryColumn) {

        insights.push(
          `${Object.keys(categoryData).length} unique categories were detected.`
        );

      }


      let insightY = 32;


      doc.setFontSize(11);

      doc.setFont(
        "helvetica",
        "normal"
      );


      insights.forEach(
        (insight, index) => {

          const text =
            `${index + 1}. ${insight}`;


          const wrappedText =
            doc.splitTextToSize(
              text,
              180
            );


          doc.text(
            wrappedText,
            14,
            insightY
          );


          insightY +=
            wrappedText.length *
              6 +
            5;

        }
      );


      // =================================================
      // FOOTER ON EVERY PAGE
      // =================================================

      const pageCount =
        doc.internal.getNumberOfPages();


      for (
        let i = 1;
        i <= pageCount;
        i++
      ) {

        doc.setPage(i);

        doc.setFontSize(8);

        doc.setFont(
          "helvetica",
          "normal"
        );

        doc.text(
          `Order Analytics | Page ${i} of ${pageCount}`,
          14,
          290
        );

      }


      // =================================================
      // DOWNLOAD
      // =================================================

      doc.save(
        "Order_Analytics_Final_Report.pdf"
      );

    } catch (error) {

      console.error(
        "PDF generation error:",
        error
      );

      alert(
        "Unable to generate the report."
      );

    }

  };


  // ====================================================
  // NO DATA SCREEN
  // ====================================================

  if (
    !dataset ||
    rows.length === 0
  ) {

    return (

      <div className="min-h-screen flex items-center justify-center p-6">

        <div className="text-center">

          <FiDatabase
            size={55}
            className="mx-auto mb-5"
          />

          <h2 className="text-2xl font-bold mb-2">
            No Analysis Data
          </h2>

          <p className="text-gray-500 mb-6">
            Upload and analyze a dataset first.
          </p>

          <button
            onClick={() =>
              (window.location.href =
                "/upload")
            }
            className="px-6 py-3 rounded-lg bg-black text-white"
          >
            Go to Upload
          </button>

        </div>

      </div>

    );

  }


  // ====================================================
  // MAIN PAGE
  // ====================================================

  return (

    <div className="p-4 md:p-6">

      {/* ================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

        <div>

          <h1 className="text-3xl font-bold">
            Analytics
          </h1>

          <p className="text-gray-500 mt-1">
            Complete analysis of your uploaded dataset
          </p>

        </div>


        <button
          onClick={downloadReport}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-black text-white hover:opacity-90 transition"
        >

          <FiDownload size={20} />

          Download Final Analysis Report

        </button>

      </div>


      {/* ================================================
          KPI CARDS
      ================================================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

        <div className="bg-white border rounded-xl p-5 shadow-sm">

          <FiFileText
            size={25}
            className="mb-3"
          />

          <p className="text-gray-500">
            Total Files
          </p>

          <h2 className="text-3xl font-bold mt-1">
            {totalFiles}
          </h2>

        </div>


        <div className="bg-white border rounded-xl p-5 shadow-sm">

          <FiDatabase
            size={25}
            className="mb-3"
          />

          <p className="text-gray-500">
            Total Rows
          </p>

          <h2 className="text-3xl font-bold mt-1">
            {totalRows.toLocaleString()}
          </h2>

        </div>


        <div className="bg-white border rounded-xl p-5 shadow-sm">

          <FiColumns
            size={25}
            className="mb-3"
          />

          <p className="text-gray-500">
            Total Columns
          </p>

          <h2 className="text-3xl font-bold mt-1">
            {totalColumns}
          </h2>

        </div>


        <div className="bg-white border rounded-xl p-5 shadow-sm">

          <FiAlertCircle
            size={25}
            className="mb-3"
          />

          <p className="text-gray-500">
            Missing Values
          </p>

          <h2 className="text-3xl font-bold mt-1">
            {missingValues}
          </h2>

        </div>

      </div>


      {/* ================================================
          BUSINESS CARDS
      ================================================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

        {salesColumn && (

          <div className="bg-white border rounded-xl p-5 shadow-sm">

            <p className="text-gray-500">
              Total Sales / Revenue
            </p>

            <h2 className="text-2xl font-bold mt-2">
              {totalSales.toLocaleString(
                undefined,
                {
                  maximumFractionDigits: 2,
                }
              )}
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              {salesColumn}
            </p>

          </div>

        )}


        {quantityColumn && (

          <div className="bg-white border rounded-xl p-5 shadow-sm">

            <p className="text-gray-500">
              Total Quantity
            </p>

            <h2 className="text-2xl font-bold mt-2">
              {totalQuantity.toLocaleString()}
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              {quantityColumn}
            </p>

          </div>

        )}


        <div className="bg-white border rounded-xl p-5 shadow-sm">

          <div className="flex items-center gap-2">

            <FiCopy size={20} />

            <p className="text-gray-500">
              Duplicate Rows
            </p>

          </div>

          <h2 className="text-2xl font-bold mt-2">
            {duplicateRows}
          </h2>

        </div>

      </div>


      {/* ================================================
          CHARTS
      ================================================= */}

      <div ref={chartsRef}>

        {/* CATEGORY BAR CHART */}

        {categoryColumn &&
          sortedCategories.length > 0 && (

            <div className="bg-white border rounded-xl p-5 md:p-6 shadow-sm mb-8 report-chart">

              <div className="flex items-center gap-2 mb-5">

                <FiBarChart2
                  size={22}
                />

                <div>

                  <h2 className="text-xl font-bold">
                    Category Distribution
                  </h2>

                  <p className="text-sm text-gray-500">
                    Number of records by category
                  </p>

                </div>

              </div>


              <div className="h-[350px]">

                <Bar
                  data={categoryChartData}
                  options={chartOptions}
                />

              </div>

            </div>

          )}


        {/* DATE LINE CHART */}

        {dateColumn &&
          sortedDates.length > 0 && (

            <div className="bg-white border rounded-xl p-5 md:p-6 shadow-sm mb-8 report-chart">

              <div className="mb-5">

                <h2 className="text-xl font-bold">
                  Data Trend Over Time
                </h2>

                <p className="text-sm text-gray-500">
                  Number of records over time
                </p>

              </div>


              <div className="h-[350px]">

                <Line
                  data={lineChartData}
                  options={chartOptions}
                />

              </div>

            </div>

          )}


        {/* DOUGHNUT CHART */}

        {categoryColumn &&
          sortedCategories.length > 0 && (

            <div className="bg-white border rounded-xl p-5 md:p-6 shadow-sm mb-8 report-chart">

              <div className="mb-5">

                <h2 className="text-xl font-bold">
                  Category Share
                </h2>

                <p className="text-sm text-gray-500">
                  Distribution of records across categories
                </p>

              </div>


              <div className="h-[350px] flex justify-center">

                <Doughnut
                  data={doughnutChartData}
                  options={chartOptions}
                />

              </div>

            </div>

          )}

      </div>


      {/* ================================================
          NUMERIC ANALYSIS
      ================================================= */}

      {numericStatistics.length > 0 && (

        <div className="bg-white border rounded-xl p-5 md:p-6 shadow-sm mb-8">

          <div className="flex items-center gap-2 mb-5">

            <FiBarChart2 size={22} />

            <h2 className="text-xl font-bold">
              Numeric Column Analysis
            </h2>

          </div>


          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>

                <tr className="border-b">

                  <th className="p-3">
                    Column
                  </th>

                  <th className="p-3">
                    Total
                  </th>

                  <th className="p-3">
                    Average
                  </th>

                  <th className="p-3">
                    Minimum
                  </th>

                  <th className="p-3">
                    Maximum
                  </th>

                </tr>

              </thead>


              <tbody>

                {numericStatistics.map(
                  (item) => (

                    <tr
                      key={item.column}
                      className="border-b"
                    >

                      <td className="p-3 font-medium">
                        {item.column}
                      </td>

                      <td className="p-3">
                        {item.total.toLocaleString(
                          undefined,
                          {
                            maximumFractionDigits: 2,
                          }
                        )}
                      </td>

                      <td className="p-3">
                        {item.average.toLocaleString(
                          undefined,
                          {
                            maximumFractionDigits: 2,
                          }
                        )}
                      </td>

                      <td className="p-3">
                        {item.minimum}
                      </td>

                      <td className="p-3">
                        {item.maximum}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      )}


      {/* ================================================
          CATEGORY TABLE
      ================================================= */}

      {sortedCategories.length > 0 && (

        <div className="bg-white border rounded-xl p-5 md:p-6 shadow-sm mb-8">

          <h2 className="text-xl font-bold mb-5">
            Category Analysis
          </h2>


          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>

                <tr className="border-b">

                  <th className="p-3">
                    Category
                  </th>

                  <th className="p-3">
                    Records
                  </th>

                </tr>

              </thead>


              <tbody>

                {sortedCategories.map(
                  ([category, count]) => (

                    <tr
                      key={category}
                      className="border-b"
                    >

                      <td className="p-3">
                        {category}
                      </td>

                      <td className="p-3 font-semibold">
                        {count}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      )}


      {/* ================================================
          FINAL DOWNLOAD
      ================================================= */}

      <div className="flex justify-center py-8">

        <button
          onClick={downloadReport}
          className="flex items-center gap-3 px-8 py-4 rounded-xl bg-black text-white text-lg font-semibold hover:opacity-90 transition shadow-lg"
        >

          <FiDownload
            size={24}
          />

          Download Final Analysis Report

        </button>

      </div>

    </div>

  );

};


export default Analytics;
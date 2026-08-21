import React from "react";
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

import { Bar, Line, Doughnut } from "react-chartjs-2";

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

function AnalyticsCharts({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
        <h3 className="text-xl font-semibold text-gray-700">
          No Data Available
        </h3>

        <p className="text-gray-500 mt-2">
          Upload a CSV, JSON or XML file to generate analytics.
        </p>
      </div>
    );
  }

  // -----------------------------
  // Detect useful columns
  // -----------------------------

  const keys = Object.keys(data[0] || {});

  const numericKeys = keys.filter((key) =>
    data.some(
      (item) =>
        item[key] !== null &&
        item[key] !== "" &&
        !isNaN(Number(item[key]))
    )
  );

  const labelKey =
    keys.find((key) =>
      ["name", "product", "category", "date", "month", "customer"].some(
        (word) => key.toLowerCase().includes(word)
      )
    ) || keys[0];

  const valueKey =
    numericKeys.find((key) =>
      ["sales", "amount", "price", "revenue", "total", "quantity"].some(
        (word) => key.toLowerCase().includes(word)
      )
    ) || numericKeys[0];

  const labels = data.slice(0, 12).map((item, index) => {
    return String(item[labelKey] ?? `Item ${index + 1}`);
  });

  const values = data.slice(0, 12).map((item) => {
    const value = Number(item[valueKey]);
    return Number.isFinite(value) ? value : 0;
  });

  // -----------------------------
  // Bar Chart
  // -----------------------------

  const barData = {
    labels,
    datasets: [
      {
        label: valueKey || "Value",
        data: values,

        borderRadius: 8,

        borderWidth: 0,

        hoverBorderWidth: 2,

        barThickness: "flex",

        maxBarThickness: 45,
      },
    ],
  };

  // -----------------------------
  // Line Chart
  // -----------------------------

  const lineData = {
    labels,

    datasets: [
      {
        label: valueKey || "Value",

        data: values,

        tension: 0.4,

        fill: true,

        pointRadius: 4,

        pointHoverRadius: 7,

        borderWidth: 3,
      },
    ],
  };

  // -----------------------------
  // Doughnut Chart
  // -----------------------------

  const doughnutData = {
    labels,

    datasets: [
      {
        label: valueKey || "Value",

        data: values,

        borderWidth: 2,

        hoverOffset: 12,
      },
    ],
  };

  // -----------------------------
  // Common Options
  // -----------------------------

  const commonOptions = {
    responsive: true,

    maintainAspectRatio: false,

    animation: {
      duration: 1800,

      easing: "easeOutQuart",
    },

    plugins: {
      legend: {
        display: true,

        position: "bottom",

        labels: {
          padding: 20,

          usePointStyle: true,
        },
      },

      tooltip: {
        enabled: true,

        padding: 12,

        cornerRadius: 10,
      },
    },
  };

  return (
    <div className="space-y-6">

      {/* ---------------- BAR ---------------- */}

      <div className="bg-white rounded-2xl shadow-sm p-6">

        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-800">
            Data Comparison
          </h2>

          <p className="text-gray-500 text-sm">
            Comparison of {valueKey || "values"} from uploaded data.
          </p>
        </div>

        <div className="h-[350px]">
          <Bar
            data={barData}
            options={{
              ...commonOptions,

              scales: {
                y: {
                  beginAtZero: true,

                  grid: {
                    display: true,
                  },
                },

                x: {
                  grid: {
                    display: false,
                  },
                },
              },

              animation: {
                duration: 2000,

                easing: "easeOutBounce",
              },
            }}
          />
        </div>
      </div>

      {/* ---------------- LINE ---------------- */}

      <div className="bg-white rounded-2xl shadow-sm p-6">

        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-800">
            Trend Analysis
          </h2>

          <p className="text-gray-500 text-sm">
            Dynamic trend generated from your uploaded dataset.
          </p>
        </div>

        <div className="h-[350px]">
          <Line
            data={lineData}
            options={{
              ...commonOptions,

              scales: {
                y: {
                  beginAtZero: true,
                },

                x: {
                  grid: {
                    display: false,
                  },
                },
              },

              animation: {
                duration: 2200,

                easing: "easeInOutQuart",
              },
            }}
          />
        </div>
      </div>

      {/* ---------------- DOUGHNUT ---------------- */}

      <div className="bg-white rounded-2xl shadow-sm p-6">

        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-800">
            Distribution
          </h2>

          <p className="text-gray-500 text-sm">
            Distribution of the selected dataset values.
          </p>
        </div>

        <div className="h-[350px] flex justify-center">
          <Doughnut
            data={doughnutData}
            options={{
              ...commonOptions,

              cutout: "65%",

              animation: {
                animateRotate: true,

                animateScale: true,

                duration: 2000,
              },
            }}
          />
        </div>
      </div>

    </div>
  );
}

export default AnalyticsCharts;
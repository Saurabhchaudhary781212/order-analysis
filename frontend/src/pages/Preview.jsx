import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
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

import {
  Bar,
  Line,
  Doughnut,
} from "react-chartjs-2";

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

function Analytics() {
  const navigate = useNavigate();

  const [dataset, setDataset] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored =
      sessionStorage.getItem("dataset");

    if (!stored) {
      setError(
        "No dataset found. Please upload data first."
      );
      return;
    }

    try {
      setDataset(JSON.parse(stored));
    } catch (err) {
      console.error(err);

      setError(
        "Unable to read the dataset."
      );
    }
  }, []);

  const rows =
    dataset?.combined_data?.rows || [];

  const columns =
    dataset?.combined_data?.columns || [];

  // ==========================================
  // FIND COLUMN
  // ==========================================

  const findColumn = (
    possibleNames
  ) => {
    return columns.find((column) =>
      possibleNames.some((name) =>
        column
          .toLowerCase()
          .includes(name)
      )
    );
  };

  const salesColumn = findColumn([
    "sales",
    "sale",
    "revenue",
    "amount",
    "total",
    "price",
  ]);

  const quantityColumn = findColumn([
    "quantity",
    "qty",
    "units",
  ]);

  const categoryColumn = findColumn([
    "category",
    "product_category",
    "type",
  ]);

  const cityColumn = findColumn([
    "city",
    "location",
    "region",
  ]);

  const orderColumn = findColumn([
    "order_id",
    "orderid",
    "order",
    "id",
  ]);

  const dateColumn = findColumn([
    "date",
    "order_date",
    "created_at",
    "created",
  ]);

  // ==========================================
  // NUMBER CONVERTER
  // ==========================================

  const numberValue = (value) => {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return 0;
    }

    const cleaned =
      String(value)
        .replace(/[$₹,]/g, "")
        .trim();

    const number =
      Number(cleaned);

    return Number.isNaN(number)
      ? 0
      : number;
  };

  // ==========================================
  // TOTAL SALES
  // ==========================================

  const totalSales = useMemo(() => {

    if (!salesColumn) {
      return 0;
    }

    return rows.reduce(
      (total, row) => {
        return (
          total +
          numberValue(
            row[salesColumn]
          )
        );
      },
      0
    );

  }, [
    rows,
    salesColumn,
  ]);

  // ==========================================
  // TOTAL QUANTITY
  // ==========================================

  const totalQuantity = useMemo(() => {

    if (!quantityColumn) {
      return 0;
    }

    return rows.reduce(
      (total, row) => {
        return (
          total +
          numberValue(
            row[quantityColumn]
          )
        );
      },
      0
    );

  }, [
    rows,
    quantityColumn,
  ]);

  // ==========================================
  // TOTAL ORDERS
  // ==========================================

  const totalOrders = useMemo(() => {

    if (!orderColumn) {
      return rows.length;
    }

    const uniqueOrders =
      new Set(
        rows
          .map(
            (row) =>
              row[orderColumn]
          )
          .filter(
            (value) =>
              value !== null &&
              value !== undefined &&
              value !== ""
          )
      );

    return uniqueOrders.size;

  }, [
    rows,
    orderColumn,
  ]);

  // ==========================================
  // AVERAGE SALES
  // ==========================================

  const averageSales =
    totalOrders > 0
      ? totalSales / totalOrders
      : 0;

  // ==========================================
  // GROUP DATA
  // ==========================================

  const groupByColumn = (
    column,
    valueColumn
  ) => {

    if (
      !column ||
      !valueColumn
    ) {
      return {};
    }

    const grouped = {};

    rows.forEach((row) => {

      const label =
        String(
          row[column] ??
            "Unknown"
        );

      const value =
        numberValue(
          row[valueColumn]
        );

      if (!grouped[label]) {
        grouped[label] = 0;
      }

      grouped[label] += value;

    });

    return grouped;
  };

  // ==========================================
  // CATEGORY SALES
  // ==========================================

  const categorySales =
    useMemo(() => {

      return groupByColumn(
        categoryColumn,
        salesColumn
      );

    }, [
      rows,
      categoryColumn,
      salesColumn,
    ]);

  // ==========================================
  // CITY SALES
  // ==========================================

  const citySales =
    useMemo(() => {

      return groupByColumn(
        cityColumn,
        salesColumn
      );

    }, [
      rows,
      cityColumn,
      salesColumn,
    ]);

  // ==========================================
  // CATEGORY QUANTITY
  // ==========================================

  const categoryQuantity =
    useMemo(() => {

      return groupByColumn(
        categoryColumn,
        quantityColumn
      );

    }, [
      rows,
      categoryColumn,
      quantityColumn,
    ]);

  // ==========================================
  // TOP CATEGORY
  // ==========================================

  const topCategory =
    useMemo(() => {

      const entries =
        Object.entries(
          categorySales
        );

      if (!entries.length) {
        return "N/A";
      }

      entries.sort(
        (a, b) =>
          b[1] - a[1]
      );

      return entries[0][0];

    }, [categorySales]);

  // ==========================================
  // TOP CITY
  // ==========================================

  const topCity =
    useMemo(() => {

      const entries =
        Object.entries(
          citySales
        );

      if (!entries.length) {
        return "N/A";
      }

      entries.sort(
        (a, b) =>
          b[1] - a[1]
      );

      return entries[0][0];

    }, [citySales]);

  // ==========================================
  // CATEGORY CHART
  // ==========================================

  const categoryChart =
    useMemo(() => {

      const entries =
        Object.entries(
          categorySales
        )
          .sort(
            (a, b) =>
              b[1] - a[1]
          )
          .slice(0, 10);

      return {

        labels:
          entries.map(
            ([label]) =>
              label
          ),

        datasets: [
          {
            label: "Sales",

            data:
              entries.map(
                ([, value]) =>
                  value
              ),

            borderWidth: 1,
          },
        ],
      };

    }, [categorySales]);

  // ==========================================
  // CITY CHART
  // ==========================================

  const cityChart =
    useMemo(() => {

      const entries =
        Object.entries(
          citySales
        )
          .sort(
            (a, b) =>
              b[1] - a[1]
          )
          .slice(0, 10);

      return {

        labels:
          entries.map(
            ([label]) =>
              label
          ),

        datasets: [
          {
            label: "Sales",

            data:
              entries.map(
                ([, value]) =>
                  value
              ),

            borderWidth: 1,
          },
        ],
      };

    }, [citySales]);

  // ==========================================
  // QUANTITY CHART
  // ==========================================

  const quantityChart =
    useMemo(() => {

      const entries =
        Object.entries(
          categoryQuantity
        )
          .sort(
            (a, b) =>
              b[1] - a[1]
          )
          .slice(0, 10);

      return {

        labels:
          entries.map(
            ([label]) =>
              label
          ),

        datasets: [
          {
            label: "Quantity",

            data:
              entries.map(
                ([, value]) =>
                  value
              ),

            borderWidth: 1,
          },
        ],
      };

    }, [categoryQuantity]);

  // ==========================================
  // DATE CHART
  // ==========================================

  const dateChart =
    useMemo(() => {

      if (
        !dateColumn ||
        !salesColumn
      ) {
        return null;
      }

      const grouped = {};

      rows.forEach((row) => {

        const date =
          String(
            row[dateColumn]
          );

        if (!date) {
          return;
        }

        const value =
          numberValue(
            row[salesColumn]
          );

        if (!grouped[date]) {
          grouped[date] = 0;
        }

        grouped[date] += value;

      });

      const entries =
        Object.entries(
          grouped
        )
          .sort(
            (a, b) =>
              new Date(a[0]) -
              new Date(b[0])
          )
          .slice(-30);

      return {

        labels:
          entries.map(
            ([date]) =>
              date
          ),

        datasets: [
          {
            label: "Sales",

            data:
              entries.map(
                ([, value]) =>
                  value
              ),

            borderWidth: 2,

            tension: 0.3,
          },
        ],
      };

    }, [
      rows,
      dateColumn,
      salesColumn,
    ]);

  // ==========================================
  // CHART OPTIONS
  // ==========================================

  const barOptions = {
    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: true,
      },
    },
  };

  const lineOptions = {
    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: true,
      },
    },
  };

  // ==========================================
  // FORMAT MONEY
  // ==========================================

  const formatMoney = (value) => {

    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(value);

  };

  // ==========================================
  // NO DATA
  // ==========================================

  if (error) {

    return (
      <div className="empty-data-page">

        <h2>
          No Analytics Data
        </h2>

        <p>
          {error}
        </p>

        <button
          className="primary-button"
          onClick={() =>
            navigate("/upload")
          }
        >
          Upload Data
        </button>

      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* =================================
          NAVBAR
      ================================= */}

      <nav className="navbar">

        <div className="navbar-brand">
          Order Analytics
        </div>

        <div className="navbar-links">

          <Link to="/dashboard">
            Dashboard
          </Link>

          <Link to="/upload">
            Upload
          </Link>

          <Link to="/preview">
            Data Preview
          </Link>

          <Link to="/analytics">
            Analytics
          </Link>

        </div>

      </nav>

      {/* =================================
          CONTENT
      ================================= */}

      <main className="analytics-page">

        <div className="page-header">

          <div>

            <h1>
              Analytics Dashboard
            </h1>

            <p>
              Analyze your uploaded
              order data.
            </p>

          </div>

          <Link
            to="/upload"
            className="primary-button"
          >
            Upload More Data
          </Link>

        </div>

        {/* =================================
            KPI CARDS
        ================================= */}

        <section className="stats-grid">

          <div className="stat-card">

            <span>
              Total Sales
            </span>

            <strong>
              {formatMoney(
                totalSales
              )}
            </strong>

            <small>
              {salesColumn ||
                "Sales column not found"}
            </small>

          </div>

          <div className="stat-card">

            <span>
              Total Orders
            </span>

            <strong>
              {totalOrders}
            </strong>

            <small>
              Unique orders
            </small>

          </div>

          <div className="stat-card">

            <span>
              Total Quantity
            </span>

            <strong>
              {totalQuantity}
            </strong>

            <small>
              {quantityColumn ||
                "Quantity column not found"}
            </small>

          </div>

          <div className="stat-card">

            <span>
              Average Order Value
            </span>

            <strong>
              {formatMoney(
                averageSales
              )}
            </strong>

            <small>
              Sales / orders
            </small>

          </div>

        </section>

        {/* =================================
            SECONDARY KPIs
        ================================= */}

        <section className="secondary-stats">

          <div className="mini-stat">

            <span>
              Top Category
            </span>

            <strong>
              {topCategory}
            </strong>

          </div>

          <div className="mini-stat">

            <span>
              Top City
            </span>

            <strong>
              {topCity}
            </strong>

          </div>

          <div className="mini-stat">

            <span>
              Records
            </span>

            <strong>
              {rows.length}
            </strong>

          </div>

          <div className="mini-stat">

            <span>
              Columns
            </span>

            <strong>
              {columns.length}
            </strong>

          </div>

        </section>

        {/* =================================
            CHART GRID
        ================================= */}

        <section className="chart-grid">

          {/* CATEGORY SALES */}

          <div className="chart-card">

            <div className="chart-header">

              <h2>
                Sales by Category
              </h2>

              <p>
                Top categories by sales
              </p>

            </div>

            <div className="chart-container">

              {categoryColumn &&
              salesColumn &&
              Object.keys(
                categorySales
              ).length > 0 ? (

                <Bar
                  data={categoryChart}
                  options={
                    barOptions
                  }
                />

              ) : (

                <div className="chart-empty">

                  Category or sales
                  column not found.

                </div>

              )}

            </div>

          </div>

          {/* CITY SALES */}

          <div className="chart-card">

            <div className="chart-header">

              <h2>
                Sales by City
              </h2>

              <p>
                Top performing cities
              </p>

            </div>

            <div className="chart-container">

              {cityColumn &&
              salesColumn &&
              Object.keys(
                citySales
              ).length > 0 ? (

                <Bar
                  data={cityChart}
                  options={
                    barOptions
                  }
                />

              ) : (

                <div className="chart-empty">

                  City or sales
                  column not found.

                </div>

              )}

            </div>

          </div>

          {/* DATE TREND */}

          <div className="chart-card chart-wide">

            <div className="chart-header">

              <h2>
                Sales Trend
              </h2>

              <p>
                Sales over time
              </p>

            </div>

            <div className="chart-container">

              {dateChart ? (

                <Line
                  data={dateChart}
                  options={
                    lineOptions
                  }
                />

              ) : (

                <div className="chart-empty">

                  A date column and
                  sales column are
                  required for this chart.

                </div>

              )}

            </div>

          </div>

          {/* QUANTITY */}

          <div className="chart-card">

            <div className="chart-header">

              <h2>
                Quantity by Category
              </h2>

              <p>
                Units sold by category
              </p>

            </div>

            <div className="chart-container">

              {categoryColumn &&
              quantityColumn ? (

                <Bar
                  data={quantityChart}
                  options={
                    barOptions
                  }
                />

              ) : (

                <div className="chart-empty">

                  Category or quantity
                  column not found.

                </div>

              )}

            </div>

          </div>

          {/* CATEGORY DOUGHNUT */}

          <div className="chart-card">

            <div className="chart-header">

              <h2>
                Category Distribution
              </h2>

              <p>
                Sales distribution
              </p>

            </div>

            <div className="chart-container">

              {categoryColumn &&
              salesColumn ? (

                <Doughnut
                  data={categoryChart}
                  options={{
                    responsive: true,
                    maintainAspectRatio:
                      false,
                  }}
                />

              ) : (

                <div className="chart-empty">

                  Category or sales
                  column not found.

                </div>

              )}

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Analytics;
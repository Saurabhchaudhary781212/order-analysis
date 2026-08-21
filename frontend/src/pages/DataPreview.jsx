import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
function DataPreview() {
  const navigate = useNavigate();

  const [dataset, setDataset] = useState(null);

  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedColumn, setSelectedColumn] = useState("all");

  const [sortConfig, setSortConfig] = useState({
    column: null,
    direction: "asc",
  });

  const [missingAction, setMissingAction] =
    useState("none");

  const [selectedRemoveColumns, setSelectedRemoveColumns] =
    useState([]);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 10;

  // ---------------------------------------
  // LOAD DATA
  // ---------------------------------------

  useEffect(() => {
    const storedDataset =
      sessionStorage.getItem("dataset");

    if (!storedDataset) {
      setError(
        "No dataset found. Please upload your files first."
      );
      return;
    }

    try {
      const parsed = JSON.parse(storedDataset);

      setDataset(parsed);

      const combinedData =
        parsed.combined_data;

      if (
        !combinedData ||
        !Array.isArray(combinedData.rows)
      ) {
        setError(
          "The uploaded dataset has an invalid format."
        );
        return;
      }

      setRows(combinedData.rows);

      setColumns(
        combinedData.columns || []
      );
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load the processed dataset."
      );
    }
  }, []);

  // ---------------------------------------
  // STATISTICS
  // ---------------------------------------

  const statistics = useMemo(() => {
    const totalRows = rows.length;

    const totalColumns = columns.length;

    let missingValues = 0;

    rows.forEach((row) => {
      columns.forEach((column) => {
        const value = row[column];

        if (
          value === null ||
          value === undefined ||
          String(value).trim() === ""
        ) {
          missingValues++;
        }
      });
    });

    const uniqueRows = new Set(
      rows.map((row) =>
        JSON.stringify(row)
      )
    ).size;

    const duplicateRows =
      rows.length - uniqueRows;

    return {
      totalRows,
      totalColumns,
      missingValues,
      duplicateRows,
    };
  }, [rows, columns]);

  // ---------------------------------------
  // SEARCH + FILTER
  // ---------------------------------------

  const filteredRows = useMemo(() => {
    let result = [...rows];

    const searchValue =
      search.trim().toLowerCase();

    if (searchValue) {
      result = result.filter((row) => {
        if (selectedColumn === "all") {
          return columns.some((column) =>
            String(
              row[column] ?? ""
            )
              .toLowerCase()
              .includes(searchValue)
          );
        }

        return String(
          row[selectedColumn] ?? ""
        )
          .toLowerCase()
          .includes(searchValue);
      });
    }

    // Sorting
    if (sortConfig.column) {
      result.sort((a, b) => {
        const valueA =
          a[sortConfig.column] ?? "";

        const valueB =
          b[sortConfig.column] ?? "";

        const numberA = Number(valueA);
        const numberB = Number(valueB);

        let comparison;

        if (
          valueA !== "" &&
          valueB !== "" &&
          !Number.isNaN(numberA) &&
          !Number.isNaN(numberB)
        ) {
          comparison =
            numberA - numberB;
        } else {
          comparison =
            String(valueA).localeCompare(
              String(valueB),
              undefined,
              {
                numeric: true,
                sensitivity: "base",
              }
            );
        }

        return sortConfig.direction === "asc"
          ? comparison
          : -comparison;
      });
    }

    return result;
  }, [
    rows,
    columns,
    search,
    selectedColumn,
    sortConfig,
  ]);

  // ---------------------------------------
  // PAGINATION
  // ---------------------------------------

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredRows.length / rowsPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) *
    rowsPerPage;

  const visibleRows =
    filteredRows.slice(
      startIndex,
      startIndex + rowsPerPage
    );

  // ---------------------------------------
  // SORT
  // ---------------------------------------

  const handleSort = (column) => {
    setSortConfig((previous) => {
      if (
        previous.column === column
      ) {
        return {
          column,
          direction:
            previous.direction === "asc"
              ? "desc"
              : "asc",
        };
      }

      return {
        column,
        direction: "asc",
      };
    });
  };

  // ---------------------------------------
  // REMOVE DUPLICATES
  // ---------------------------------------

  const removeDuplicates = () => {
    const unique = [];
    const seen = new Set();

    rows.forEach((row) => {
      const key = JSON.stringify(row);

      if (!seen.has(key)) {
        seen.add(key);
        unique.push(row);
      }
    });

    const removed =
      rows.length - unique.length;

    setRows(unique);
    setCurrentPage(1);

    setMessage(
      removed > 0
        ? `${removed} duplicate row(s) removed.`
        : "No duplicate rows found."
    );
  };

  // ---------------------------------------
  // MISSING VALUES
  // ---------------------------------------

  const handleMissingValues = () => {
    if (missingAction === "none") {
      setMessage(
        "Select a missing-value action first."
      );
      return;
    }

    if (missingAction === "remove_rows") {
      const cleanedRows = rows.filter(
        (row) =>
          !columns.some((column) => {
            const value = row[column];

            return (
              value === null ||
              value === undefined ||
              String(value).trim() === ""
            );
          })
      );

      const removed =
        rows.length - cleanedRows.length;

      setRows(cleanedRows);
      setCurrentPage(1);

      setMessage(
        `${removed} row(s) with missing values removed.`
      );

      return;
    }

    if (missingAction === "fill_empty") {
      const cleanedRows = rows.map(
        (row) => {
          const newRow = { ...row };

          columns.forEach((column) => {
            const value = newRow[column];

            if (
              value === null ||
              value === undefined ||
              String(value).trim() === ""
            ) {
              newRow[column] = "N/A";
            }
          });

          return newRow;
        }
      );

      setRows(cleanedRows);

      setMessage(
        "Missing values replaced with N/A."
      );

      return;
    }

    if (missingAction === "fill_zero") {
      const cleanedRows = rows.map(
        (row) => {
          const newRow = { ...row };

          columns.forEach((column) => {
            const value = newRow[column];

            if (
              value === null ||
              value === undefined ||
              String(value).trim() === ""
            ) {
              newRow[column] = 0;
            }
          });

          return newRow;
        }
      );

      setRows(cleanedRows);

      setMessage(
        "Missing values replaced with 0."
      );
    }
  };

  // ---------------------------------------
  // REMOVE COLUMNS
  // ---------------------------------------

  const toggleColumnSelection = (
    column
  ) => {
    setSelectedRemoveColumns(
      (previous) => {
        if (previous.includes(column)) {
          return previous.filter(
            (item) => item !== column
          );
        }

        return [
          ...previous,
          column,
        ];
      }
    );
  };

  const removeSelectedColumns = () => {
    if (
      selectedRemoveColumns.length === 0
    ) {
      setMessage(
        "Select at least one column to remove."
      );
      return;
    }

    const newColumns =
      columns.filter(
        (column) =>
          !selectedRemoveColumns.includes(
            column
          )
      );

    const newRows = rows.map((row) => {
      const newRow = {};

      newColumns.forEach((column) => {
        newRow[column] = row[column];
      });

      return newRow;
    });

    setColumns(newColumns);
    setRows(newRows);

    setSelectedRemoveColumns([]);

    setMessage(
      `${selectedRemoveColumns.length} column(s) removed.`
    );

    setCurrentPage(1);
  };

  // ---------------------------------------
  // RESET DATA
  // ---------------------------------------

  const resetData = () => {
    if (!dataset?.combined_data) {
      return;
    }

    setRows(
      dataset.combined_data.rows || []
    );

    setColumns(
      dataset.combined_data.columns || []
    );

    setSearch("");
    setSelectedColumn("all");

    setSortConfig({
      column: null,
      direction: "asc",
    });

    setSelectedRemoveColumns([]);

    setMissingAction("none");

    setCurrentPage(1);

    setMessage(
      "Dataset restored to the original processed data."
    );
  };

  // ---------------------------------------
  // SAVE CLEANED DATA
  // ---------------------------------------

  const saveCleanedData = () => {
    const cleanedDataset = {
      ...dataset,

      combined_data: {
        columns,
        rows,
        row_count: rows.length,
        column_count: columns.length,
      },
    };

    sessionStorage.setItem(
      "dataset",
      JSON.stringify(
        cleanedDataset
      )
    );

    setDataset(cleanedDataset);

    setMessage(
      "Cleaned dataset saved successfully."
    );
  };

  // ---------------------------------------
  // CLEAR SEARCH
  // ---------------------------------------

  const clearSearch = () => {
    setSearch("");
    setSelectedColumn("all");
    setCurrentPage(1);
  };

  // ---------------------------------------
  // NO DATA
  // ---------------------------------------

  if (error && !dataset) {
    return (
      <div className="empty-data-page">

        <h2>
          No Dataset Available
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

      {/* NAVBAR */}

      <nav className="navbar">

        <div className="navbar-brand">
          Data Analytics
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

      <main className="data-page">

        {/* HEADER */}

        <div className="page-header">

          <div>
            <h1>
              Data Preview & Cleaning
            </h1>

            <p>
              Explore, filter and clean your
              uploaded dataset.
            </p>
          </div>

          <div className="header-buttons">

            <button
              className="secondary-button"
              onClick={resetData}
            >
              Reset
            </button>

            <button
              className="primary-small-button"
              onClick={saveCleanedData}
            >
              Save Changes
            </button>

          </div>

        </div>

        {/* MESSAGES */}

        {message && (
          <div className="info-message">
            ✓ {message}
          </div>
        )}

        {/* STATISTICS */}

        <div className="stats-grid">

          <div className="stat-card">
            <span>
              Total Rows
            </span>

            <strong>
              {statistics.totalRows}
            </strong>
          </div>

          <div className="stat-card">
            <span>
              Total Columns
            </span>

            <strong>
              {statistics.totalColumns}
            </strong>
          </div>

          <div className="stat-card">
            <span>
              Missing Values
            </span>

            <strong>
              {statistics.missingValues}
            </strong>
          </div>

          <div className="stat-card">
            <span>
              Duplicate Rows
            </span>

            <strong>
              {statistics.duplicateRows}
            </strong>
          </div>

        </div>

        {/* CLEANING TOOLS */}

        <section className="tools-card">

          <div className="section-title">
            <h2>
              Data Cleaning
            </h2>

            <span>
              Clean your dataset before
              analysis
            </span>
          </div>

          {/* MISSING VALUES */}

          <div className="tool-row">

            <div className="tool-content">

              <h3>
                Missing Values
              </h3>

              <p>
                Choose how to handle empty
                values.
              </p>

            </div>

            <div className="tool-actions">

              <select
                value={missingAction}
                onChange={(e) =>
                  setMissingAction(
                    e.target.value
                  )
                }
              >
                <option value="none">
                  Select action
                </option>

                <option value="remove_rows">
                  Remove rows
                </option>

                <option value="fill_empty">
                  Replace with N/A
                </option>

                <option value="fill_zero">
                  Replace with 0
                </option>

              </select>

              <button
                className="action-button"
                onClick={
                  handleMissingValues
                }
              >
                Apply
              </button>

            </div>

          </div>

          {/* DUPLICATES */}

          <div className="tool-row">

            <div className="tool-content">

              <h3>
                Duplicate Rows
              </h3>

              <p>
                Remove rows containing
                duplicate data.
              </p>

            </div>

            <button
              className="action-button"
              onClick={removeDuplicates}
            >
              Remove Duplicates
            </button>

          </div>

          {/* REMOVE COLUMNS */}

          <div className="column-cleaner">

            <div className="tool-content">

              <h3>
                Remove Columns
              </h3>

              <p>
                Select columns that you don't
                need.
              </p>

            </div>

            <div className="column-selection">

              {columns.map(
                (column) => (
                  <label
                    className="column-checkbox"
                    key={column}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRemoveColumns.includes(
                        column
                      )}
                      onChange={() =>
                        toggleColumnSelection(
                          column
                        )
                      }
                    />

                    <span>
                      {column}
                    </span>
                  </label>
                )
              )}

            </div>

            <button
              className="danger-button"
              onClick={
                removeSelectedColumns
              }
            >
              Remove Selected Columns
            </button>

          </div>

        </section>

        {/* SEARCH / FILTER */}

        <section className="table-card">

          <div className="table-header">

            <div>
              <h2>
                Dataset
              </h2>

              <p>
                Showing{" "}
                {filteredRows.length}{" "}
                matching rows
              </p>
            </div>

          </div>

          <div className="filter-bar">

            <div className="search-box">

              <input
                type="text"
                placeholder="Search data..."
                value={search}
                onChange={(e) => {
                  setSearch(
                    e.target.value
                  );
                  setCurrentPage(1);
                }}
              />

            </div>

            <select
              value={selectedColumn}
              onChange={(e) => {
                setSelectedColumn(
                  e.target.value
                );
                setCurrentPage(1);
              }}
            >
              <option value="all">
                All Columns
              </option>

              {columns.map(
                (column) => (
                  <option
                    value={column}
                    key={column}
                  >
                    {column}
                  </option>
                )
              )}

            </select>

            <button
              className="secondary-button"
              onClick={clearSearch}
            >
              Clear Filter
            </button>

          </div>

          {/* TABLE */}

          <div className="table-wrapper">

            <table className="data-table">

              <thead>

                <tr>

                  <th>
                    #
                  </th>

                  {columns.map(
                    (column) => (
                      <th
                        key={column}
                        onClick={() =>
                          handleSort(
                            column
                          )
                        }
                        className="sortable-header"
                      >
                        <span>
                          {column}
                        </span>

                        <span>
                          {sortConfig.column ===
                          column
                            ? sortConfig.direction ===
                              "asc"
                              ? " ↑"
                              : " ↓"
                            : " ↕"}
                        </span>

                      </th>
                    )
                  )}

                </tr>

              </thead>

              <tbody>

                {visibleRows.length === 0 ? (
                  <tr>

                    <td
                      colSpan={
                        columns.length + 1
                      }
                      className="no-results"
                    >
                      No matching data found.
                    </td>

                  </tr>
                ) : (
                  visibleRows.map(
                    (row, rowIndex) => (
                      <tr
                        key={rowIndex}
                      >

                        <td>
                          {startIndex +
                            rowIndex +
                            1}
                        </td>

                        {columns.map(
                          (column) => (
                            <td
                              key={
                                column
                              }
                            >
                              {row[
                                column
                              ] ===
                                null ||
                              row[
                                column
                              ] ===
                                undefined ||
                              row[
                                column
                              ] ===
                                ""
                                ? (
                                  <span className="missing-cell">
                                    Missing
                                  </span>
                                )
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
                  )
                )}

              </tbody>

            </table>

          </div>

          {/* PAGINATION */}

          <div className="pagination">

            <button
              disabled={
                safeCurrentPage === 1
              }
              onClick={() =>
                setCurrentPage(
                  (page) =>
                    Math.max(
                      1,
                      page - 1
                    )
                )
              }
            >
              ← Previous
            </button>

            <span>
              Page{" "}
              {safeCurrentPage}{" "}
              of{" "}
              {totalPages}
            </span>

            <button
              disabled={
                safeCurrentPage ===
                totalPages
              }
              onClick={() =>
                setCurrentPage(
                  (page) =>
                    Math.min(
                      totalPages,
                      page + 1
                    )
                )
              }
            >
              Next →
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

export default DataPreview;
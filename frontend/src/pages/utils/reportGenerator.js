import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import {
    Chart,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";

// ============================================================
// CHART.JS REGISTRATION
// ============================================================

Chart.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler
);

// ============================================================
// CONSTANTS
// ============================================================

const CHART_WIDTH = 1200;
const CHART_HEIGHT = 600;

const COLORS = [
    "#4f46e5",
    "#7c3aed",
    "#2563eb",
    "#0891b2",
    "#059669",
    "#65a30d",
    "#ca8a04",
    "#ea580c",
    "#dc2626",
    "#db2777",
];

const LIGHT_BACKGROUND = "#f8fafc";
const DARK_TEXT = "#111827";
const MUTED_TEXT = "#6b7280";
const BORDER_COLOR = "#e5e7eb";

// ============================================================
// GENERAL HELPERS
// ============================================================

const safeString = (value) => {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value).trim();
};

const toNumber = (value) => {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    if (typeof value === "number") {
        return Number.isFinite(value) ? value : null;
    }

    const cleaned = String(value)
        .replace(/[$₹€£,\s]/g, "")
        .replace(/%/g, "");

    if (cleaned === "") {
        return null;
    }

    const number = Number(cleaned);

    return Number.isFinite(number) ? number : null;
};

const formatNumber = (value, decimals = 2) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return "0";
    }

    return Number(value).toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
};

const formatInteger = (value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return "0";
    }

    return Number(value).toLocaleString("en-IN", {
        maximumFractionDigits: 0,
    });
};

const truncateText = (value, maxLength = 35) => {
    const text = safeString(value);

    if (text.length <= maxLength) {
        return text;
    }

    return `${text.substring(0, maxLength - 3)}...`;
};

// ============================================================
// COLUMN DETECTION
// ============================================================

const findColumn = (columns, keywords) => {
    if (!Array.isArray(columns)) {
        return null;
    }

    const normalizedColumns = columns.map((column) => ({
        original: column,
        normalized: safeString(column).toLowerCase().replace(/[_\-\s]/g, ""),
    }));

    for (const keyword of keywords) {
        const normalizedKeyword = keyword
            .toLowerCase()
            .replace(/[_\-\s]/g, "");

        const exact = normalizedColumns.find(
            (column) => column.normalized === normalizedKeyword
        );

        if (exact) {
            return exact.original;
        }
    }

    for (const keyword of keywords) {
        const normalizedKeyword = keyword
            .toLowerCase()
            .replace(/[_\-\s]/g, "");

        const partial = normalizedColumns.find((column) =>
            column.normalized.includes(normalizedKeyword)
        );

        if (partial) {
            return partial.original;
        }
    }

    return null;
};

const isNumericColumn = (rows, column) => {
    if (!Array.isArray(rows) || !column || rows.length === 0) {
        return false;
    }

    const values = rows
        .map((row) => row ? .[column])
        .filter(
            (value) =>
            value !== null &&
            value !== undefined &&
            safeString(value) !== ""
        );

    if (values.length === 0) {
        return false;
    }

    const numericValues = values.filter(
        (value) => toNumber(value) !== null
    );

    return numericValues.length / values.length >= 0.7;
};

const getNumericColumns = (rows, columns) => {
    if (!Array.isArray(columns)) {
        return [];
    }

    return columns.filter((column) => isNumericColumn(rows, column));
};

// ============================================================
// DATA GROUPING
// ============================================================

const groupByCount = (rows, column) => {
    const map = new Map();

    if (!Array.isArray(rows) || !column) {
        return [];
    }

    rows.forEach((row) => {
        const value = safeString(row ? .[column]) || "Unknown";

        map.set(value, (map.get(value) || 0) + 1);
    });

    return Array.from(map.entries())
        .map(([label, value]) => ({
            label,
            value,
        }))
        .sort((a, b) => b.value - a.value);
};

const groupBySum = (rows, groupColumn, valueColumn) => {
    const map = new Map();

    if (!Array.isArray(rows) || !groupColumn || !valueColumn) {
        return [];
    }

    rows.forEach((row) => {
        const group = safeString(row ? .[groupColumn]) || "Unknown";
        const value = toNumber(row ? .[valueColumn]);

        if (value === null) {
            return;
        }

        map.set(group, (map.get(group) || 0) + value);
    });

    return Array.from(map.entries())
        .map(([label, value]) => ({
            label,
            value,
        }))
        .sort((a, b) => b.value - a.value);
};

// ============================================================
// DATE HELPERS
// ============================================================

const parseDate = (value) => {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
};

const formatDateLabel = (date) => {
    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const getDateColumn = (columns) => {
    return findColumn(columns, [
        "date",
        "orderdate",
        "order_date",
        "createdat",
        "created_at",
        "datetime",
        "timestamp",
        "time",
        "month",
        "year",
    ]);
};

const getDateTrend = (rows, dateColumn, valueColumn = null) => {
    if (!Array.isArray(rows) || !dateColumn) {
        return [];
    }

    const map = new Map();

    rows.forEach((row) => {
        const date = parseDate(row ? .[dateColumn]);

        if (!date) {
            return;
        }

        const timestamp = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        ).getTime();

        const existing = map.get(timestamp) || {
            date,
            count: 0,
            value: 0,
        };

        existing.count += 1;

        if (valueColumn) {
            const value = toNumber(row ? .[valueColumn]);

            if (value !== null) {
                existing.value += value;
            }
        }

        map.set(timestamp, existing);
    });

    return Array.from(map.values()).sort(
        (a, b) => a.date.getTime() - b.date.getTime()
    );
};

// ============================================================
// CHART IMAGE GENERATOR
// ============================================================

const createChartImage = ({
    type,
    labels,
    data,
    label,
    title,
    colors = COLORS,
    isCurrency = false,
}) => {
    return new Promise((resolve, reject) => {
        try {
            const canvas = document.createElement("canvas");

            canvas.width = CHART_WIDTH;
            canvas.height = CHART_HEIGHT;

            canvas.style.position = "fixed";
            canvas.style.left = "-10000px";
            canvas.style.top = "0";
            canvas.style.width = `${CHART_WIDTH}px`;
            canvas.style.height = `${CHART_HEIGHT}px`;

            document.body.appendChild(canvas);

            const ctx = canvas.getContext("2d");

            if (!ctx) {
                canvas.remove();
                reject(new Error("Unable to create chart canvas."));
                return;
            }

            const isDoughnut = type === "doughnut";
            const isLine = type === "line";
            const isBar = type === "bar";

            const dataset = {
                label: label || "",
                data,
                borderWidth: isDoughnut ? 1 : 2,
                borderColor: isDoughnut ?
                    "#ffffff" :
                    colors[0] || "#4f46e5",
                backgroundColor: isDoughnut ?
                    colors :
                    isLine ?
                    "rgba(79, 70, 229, 0.16)" :
                    "rgba(79, 70, 229, 0.75)",
                fill: isLine,
                tension: 0.35,
                pointRadius: isLine ? 4 : 0,
                pointHoverRadius: isLine ? 6 : 0,
                borderRadius: isBar ? 6 : 0,
            };

            const chart = new Chart(ctx, {
                type,
                data: {
                    labels,
                    datasets: [dataset],
                },
                options: {
                    responsive: false,
                    animation: false,
                    devicePixelRatio: 2,
                    maintainAspectRatio: false,

                    plugins: {
                        title: {
                            display: Boolean(title),
                            text: title || "",
                            color: DARK_TEXT,
                            font: {
                                size: 22,
                                weight: "bold",
                            },
                            padding: {
                                bottom: 20,
                            },
                        },

                        legend: {
                            display: isDoughnut,
                            position: "bottom",
                            labels: {
                                color: DARK_TEXT,
                                padding: 18,
                                font: {
                                    size: 13,
                                },
                            },
                        },

                        tooltip: {
                            enabled: false,
                        },
                    },

                    scales: isDoughnut ?
                        {} :
                        {
                            x: {
                                grid: {
                                    display: false,
                                },
                                ticks: {
                                    color: MUTED_TEXT,
                                    maxRotation: 45,
                                    minRotation: 0,
                                    font: {
                                        size: 12,
                                    },
                                },
                            },

                            y: {
                                beginAtZero: true,
                                grid: {
                                    color: "#e5e7eb",
                                },
                                ticks: {
                                    color: MUTED_TEXT,
                                    font: {
                                        size: 12,
                                    },
                                    callback: (value) => {
                                        if (isCurrency) {
                                            return `₹${formatInteger(value)}`;
                                        }

                                        return formatInteger(value);
                                    },
                                },
                            },
                        },
                },
            });

            requestAnimationFrame(() => {
                try {
                    const image = canvas.toDataURL("image/png", 1.0);

                    chart.destroy();
                    canvas.remove();

                    resolve(image);
                } catch (error) {
                    chart.destroy();
                    canvas.remove();
                    reject(error);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
};

// ============================================================
// PDF HELPERS
// ============================================================

const addPageHeader = (doc, title) => {
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 18, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(title, 14, 11);

    doc.setTextColor(DARK_TEXT);
};

const addSectionTitle = (doc, title, y) => {
    doc.setFillColor(79, 70, 229);
    doc.roundedRect(14, y, 182, 9, 2, 2, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");

    doc.text(title, 19, y + 6);

    doc.setTextColor(DARK_TEXT);

    return y + 15;
};

const addKpiCard = (doc, x, y, width, title, value) => {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(229, 231, 235);

    doc.roundedRect(x, y, width, 25, 3, 3, "FD");

    doc.setTextColor(MUTED_TEXT);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");

    doc.text(title, x + 5, y + 8);

    doc.setTextColor(DARK_TEXT);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");

    doc.text(
        truncateText(String(value), 22),
        x + 5,
        y + 18
    );
};

const addChartPage = async(
    doc, {
        title,
        type,
        labels,
        data,
        label,
        colors,
        isCurrency,
    }
) => {
    doc.addPage();

    addPageHeader(doc, "Order Analytics Report");

    doc.setTextColor(DARK_TEXT);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");

    doc.text(title, 14, 32);

    try {
        const image = await createChartImage({
            type,
            labels,
            data,
            label,
            title,
            colors,
            isCurrency,
        });

        doc.addImage(
            image,
            "PNG",
            14,
            42,
            182,
            91
        );
    } catch (error) {
        console.error("Chart generation failed:", error);

        doc.setTextColor(220, 38, 38);
        doc.setFontSize(10);

        doc.text(
            "Unable to generate this chart.",
            14,
            50
        );
    }
};

// ============================================================
// MAIN REPORT GENERATOR
// ============================================================

export const downloadFinalAnalysisReport = async() => {
    try {
        // --------------------------------------------------------
        // LOAD DATA
        // --------------------------------------------------------

        const storedDataset = sessionStorage.getItem("dataset");

        if (!storedDataset) {
            alert(
                "No analysis data found. Please upload and analyze your dataset first."
            );
            return;
        }

        let dataset;

        try {
            dataset = JSON.parse(storedDataset);
        } catch (error) {
            console.error("Dataset JSON parsing failed:", error);

            alert("Unable to read the analysis data.");
            return;
        }

        const combinedData = dataset ? .combined_data || {};

        const rows = Array.isArray(combinedData ? .rows) ?
            combinedData.rows :
            [];

        const columns = Array.isArray(combinedData ? .columns) ?
            combinedData.columns :
            [];

        const summary = dataset ? .summary || {};

        // --------------------------------------------------------
        // BASIC DATA INFORMATION
        // --------------------------------------------------------

        const totalRows =
            summary ? .total_rows ? ?
            rows.length;

        const totalColumns =
            summary ? .total_columns ? ?
            columns.length;

        const totalFiles =
            summary ? .total_files ? ?
            dataset ? .files ? .length ? ?
            0;

        // --------------------------------------------------------
        // DETECT IMPORTANT COLUMNS
        // --------------------------------------------------------

        const salesColumn = findColumn(columns, [
            "revenue",
            "sales",
            "sale",
            "amount",
            "total",
            "totalamount",
            "total_amount",
            "price",
            "value",
            "orderamount",
            "order_amount",
        ]);

        const quantityColumn = findColumn(columns, [
            "quantity",
            "qty",
            "units",
            "items",
            "count",
        ]);

        const categoryColumn = findColumn(columns, [
            "category",
            "categories",
            "type",
            "segment",
            "department",
        ]);

        const productColumn = findColumn(columns, [
            "product",
            "productname",
            "product_name",
            "item",
            "itemname",
            "item_name",
        ]);

        const cityColumn = findColumn(columns, [
            "city",
            "location",
            "region",
            "state",
            "country",
        ]);

        const customerColumn = findColumn(columns, [
            "customer",
            "customername",
            "customer_name",
            "client",
            "buyer",
        ]);

        const dateColumn = getDateColumn(columns);

        // --------------------------------------------------------
        // NUMERIC COLUMNS
        // --------------------------------------------------------

        const numericColumns = getNumericColumns(
            rows,
            columns
        );

        // --------------------------------------------------------
        // DATA QUALITY
        // --------------------------------------------------------

        let missingValues = 0;

        rows.forEach((row) => {
            columns.forEach((column) => {
                const value = row ? .[column];

                if (
                    value === null ||
                    value === undefined ||
                    safeString(value) === ""
                ) {
                    missingValues += 1;
                }
            });
        });

        const rowKeys = new Set();

        let duplicateRows = 0;

        rows.forEach((row) => {
            const key = columns
                .map((column) => safeString(row ? .[column]))
                .join("||");

            if (rowKeys.has(key)) {
                duplicateRows += 1;
            } else {
                rowKeys.add(key);
            }
        });

        const totalCells = totalRows * totalColumns;

        const missingPercentage =
            totalCells > 0 ?
            (missingValues / totalCells) * 100 :
            0;

        // --------------------------------------------------------
        // BUSINESS METRICS
        // --------------------------------------------------------

        let totalSales = 0;
        let totalQuantity = 0;

        if (salesColumn) {
            rows.forEach((row) => {
                const value = toNumber(row ? .[salesColumn]);

                if (value !== null) {
                    totalSales += value;
                }
            });
        }

        if (quantityColumn) {
            rows.forEach((row) => {
                const value = toNumber(row ? .[quantityColumn]);

                if (value !== null) {
                    totalQuantity += value;
                }
            });
        }

        const averageOrderValue =
            totalRows > 0 && salesColumn ?
            totalSales / totalRows :
            0;

        // --------------------------------------------------------
        // CATEGORY DATA
        // --------------------------------------------------------

        const categoryCounts = categoryColumn ?
            groupByCount(rows, categoryColumn) :
            [];

        const categorySales =
            categoryColumn && salesColumn ?
            groupBySum(
                rows,
                categoryColumn,
                salesColumn
            ) :
            [];

        // --------------------------------------------------------
        // PRODUCT DATA
        // --------------------------------------------------------

        const productCounts = productColumn ?
            groupByCount(rows, productColumn) :
            [];

        const productSales =
            productColumn && salesColumn ?
            groupBySum(
                rows,
                productColumn,
                salesColumn
            ) :
            [];

        // --------------------------------------------------------
        // CITY DATA
        // --------------------------------------------------------

        const cityCounts = cityColumn ?
            groupByCount(rows, cityColumn) :
            [];

        const citySales =
            cityColumn && salesColumn ?
            groupBySum(
                rows,
                cityColumn,
                salesColumn
            ) :
            [];

        // --------------------------------------------------------
        // DATE DATA
        // --------------------------------------------------------

        const dateTrend = getDateTrend(
            rows,
            dateColumn,
            salesColumn
        );

        // --------------------------------------------------------
        // CREATE PDF
        // --------------------------------------------------------

        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        // ========================================================
        // PAGE 1 — COVER / OVERVIEW
        // ========================================================

        doc.setFillColor(79, 70, 229);
        doc.rect(0, 0, 210, 55, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(25);

        doc.text(
            "Order Analytics Report",
            14,
            25
        );

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        doc.text(
            "Automated dataset analysis and business insights",
            14,
            36
        );

        doc.text(
            `Generated on ${new Date().toLocaleString(
                "en-IN"
            )}`,
            14,
            44
        );

        doc.setTextColor(DARK_TEXT);

        let y = 68;

        y = addSectionTitle(
            doc,
            "Executive Overview",
            y
        );

        // KPI ROW 1

        addKpiCard(
            doc,
            14,
            y,
            56,
            "Total records",
            formatInteger(totalRows)
        );

        addKpiCard(
            doc,
            77,
            y,
            56,
            "Columns",
            formatInteger(totalColumns)
        );

        addKpiCard(
            doc,
            140,
            y,
            56,
            "Files analyzed",
            formatInteger(totalFiles)
        );

        y += 34;

        // KPI ROW 2

        addKpiCard(
            doc,
            14,
            y,
            56,
            salesColumn ?
            "Total revenue" :
            "Missing values",
            salesColumn ?
            `₹${formatNumber(totalSales)}` :
            formatInteger(missingValues)
        );

        addKpiCard(
            doc,
            77,
            y,
            56,
            quantityColumn ?
            "Total quantity" :
            "Duplicate rows",
            quantityColumn ?
            formatNumber(totalQuantity) :
            formatInteger(duplicateRows)
        );

        addKpiCard(
            doc,
            140,
            y,
            56,
            salesColumn ?
            "Average order value" :
            "Missing %",
            salesColumn ?
            `₹${formatNumber(
                      averageOrderValue
                  )}` :
            `${missingPercentage.toFixed(2)}%`
        );

        y += 39;

        y = addSectionTitle(
            doc,
            "Detected Dataset Structure",
            y
        );

        const structureRows = [
            [
                "Revenue / sales column",
                salesColumn || "Not detected",
            ],
            [
                "Quantity column",
                quantityColumn || "Not detected",
            ],
            [
                "Category column",
                categoryColumn || "Not detected",
            ],
            [
                "Product column",
                productColumn || "Not detected",
            ],
            [
                "Location column",
                cityColumn || "Not detected",
            ],
            [
                "Customer column",
                customerColumn || "Not detected",
            ],
            [
                "Date column",
                dateColumn || "Not detected",
            ],
        ];

        autoTable(doc, {
            startY: y,
            head: [
                ["Field", "Detected column"]
            ],
            body: structureRows,
            theme: "grid",

            headStyles: {
                fillColor: [79, 70, 229],
                textColor: 255,
                fontStyle: "bold",
            },

            bodyStyles: {
                fontSize: 8,
            },

            alternateRowStyles: {
                fillColor: [248, 250, 252],
            },

            margin: {
                left: 14,
                right: 14,
            },
        });

        // ========================================================
        // PAGE 2 — DATA QUALITY
        // ========================================================

        doc.addPage();

        addPageHeader(
            doc,
            "Order Analytics Report"
        );

        y = 30;

        y = addSectionTitle(
            doc,
            "Data Quality Analysis",
            y
        );

        const qualityRows = [
            [
                "Total rows",
                formatInteger(totalRows),
            ],
            [
                "Total columns",
                formatInteger(totalColumns),
            ],
            [
                "Total cells",
                formatInteger(totalCells),
            ],
            [
                "Missing values",
                formatInteger(missingValues),
            ],
            [
                "Missing percentage",
                `${missingPercentage.toFixed(2)}%`,
            ],
            [
                "Duplicate rows",
                formatInteger(duplicateRows),
            ],
            [
                "Numeric columns",
                formatInteger(
                    numericColumns.length
                ),
            ],
        ];

        autoTable(doc, {
            startY: y,
            head: [
                ["Metric", "Value"]
            ],
            body: qualityRows,
            theme: "grid",

            headStyles: {
                fillColor: [79, 70, 229],
                textColor: 255,
                fontStyle: "bold",
            },

            alternateRowStyles: {
                fillColor: [248, 250, 252],
            },

            bodyStyles: {
                fontSize: 9,
            },

            margin: {
                left: 14,
                right: 14,
            },
        });

        y =
            doc.lastAutoTable.finalY + 18;

        y = addSectionTitle(
            doc,
            "Numeric Columns",
            y
        );

        const numericRows =
            numericColumns.length > 0 ?
            numericColumns.map((column) => {
                const values = rows
                    .map((row) =>
                        toNumber(
                            row ? .[column]
                        )
                    )
                    .filter(
                        (value) =>
                        value !== null
                    );

                const sum = values.reduce(
                    (acc, value) =>
                    acc + value,
                    0
                );

                const average =
                    values.length > 0 ?
                    sum /
                    values.length :
                    0;

                const min =
                    values.length > 0 ?
                    Math.min(
                        ...values
                    ) :
                    0;

                const max =
                    values.length > 0 ?
                    Math.max(
                        ...values
                    ) :
                    0;

                return [
                    column,
                    formatInteger(
                        values.length
                    ),
                    formatNumber(min),
                    formatNumber(max),
                    formatNumber(average),
                    formatNumber(sum),
                ];
            }) :
            [
                [
                    "No numeric columns detected",
                    "-",
                    "-",
                    "-",
                    "-",
                    "-",
                ],
            ];

        autoTable(doc, {
            startY: y,
            head: [
                [
                    "Column",
                    "Values",
                    "Minimum",
                    "Maximum",
                    "Average",
                    "Sum",
                ],
            ],
            body: numericRows,
            theme: "grid",

            headStyles: {
                fillColor: [79, 70, 229],
                textColor: 255,
                fontStyle: "bold",
            },

            bodyStyles: {
                fontSize: 7,
            },

            alternateRowStyles: {
                fillColor: [248, 250, 252],
            },

            margin: {
                left: 14,
                right: 14,
            },
        });

        // ========================================================
        // PAGE 3 — BUSINESS ANALYSIS
        // ========================================================

        doc.addPage();

        addPageHeader(
            doc,
            "Order Analytics Report"
        );

        y = 30;

        y = addSectionTitle(
            doc,
            "Business Metrics",
            y
        );

        const businessRows = [
            [
                "Total records",
                formatInteger(totalRows),
            ],
            [
                "Total revenue",
                salesColumn ?
                `₹${formatNumber(
                          totalSales
                      )}` :
                "Revenue column not detected",
            ],
            [
                "Total quantity",
                quantityColumn ?
                formatNumber(
                    totalQuantity
                ) :
                "Quantity column not detected",
            ],
            [
                "Average order value",
                salesColumn ?
                `₹${formatNumber(
                          averageOrderValue
                      )}` :
                "Not available",
            ],
            [
                "Categories",
                categoryCounts.length > 0 ?
                formatInteger(
                    categoryCounts.length
                ) :
                "Not detected",
            ],
            [
                "Products",
                productCounts.length > 0 ?
                formatInteger(
                    productCounts.length
                ) :
                "Not detected",
            ],
            [
                "Locations",
                cityCounts.length > 0 ?
                formatInteger(
                    cityCounts.length
                ) :
                "Not detected",
            ],
        ];

        autoTable(doc, {
            startY: y,
            head: [
                ["Business metric", "Result"]
            ],
            body: businessRows,
            theme: "grid",

            headStyles: {
                fillColor: [79, 70, 229],
                textColor: 255,
                fontStyle: "bold",
            },

            bodyStyles: {
                fontSize: 8,
            },

            alternateRowStyles: {
                fillColor: [248, 250, 252],
            },

            margin: {
                left: 14,
                right: 14,
            },
        });

        // ========================================================
        // CATEGORY TABLE
        // ========================================================

        if (categoryCounts.length > 0) {
            y =
                doc.lastAutoTable.finalY + 16;

            y = addSectionTitle(
                doc,
                "Category Analysis",
                y
            );

            const categoryMap = new Map(
                categorySales.map((item) => [
                    item.label,
                    item.value,
                ])
            );

            const categoryRows =
                categoryCounts
                .slice(0, 15)
                .map((item, index) => [
                    String(index + 1),
                    truncateText(
                        item.label,
                        35
                    ),
                    formatInteger(
                        item.value
                    ),
                    salesColumn &&
                    categoryMap.has(
                        item.label
                    ) ?
                    `₹${formatNumber(
                                  categoryMap.get(
                                      item.label
                                  )
                              )}` :
                    "-",
                ]);

            autoTable(doc, {
                startY: y,
                head: [
                    [
                        "#",
                        "Category",
                        "Records",
                        "Revenue",
                    ],
                ],
                body: categoryRows,
                theme: "grid",

                headStyles: {
                    fillColor: [79, 70, 229],
                    textColor: 255,
                    fontStyle: "bold",
                },

                bodyStyles: {
                    fontSize: 8,
                },

                alternateRowStyles: {
                    fillColor: [248, 250, 252],
                },

                margin: {
                    left: 14,
                    right: 14,
                },
            });
        }

        // ========================================================
        // PAGE 4 — DATA PREVIEW
        // ========================================================

        doc.addPage();

        addPageHeader(
            doc,
            "Order Analytics Report"
        );

        y = 30;

        y = addSectionTitle(
            doc,
            "Data Preview",
            y
        );

        const previewRows = rows
            .slice(0, 20)
            .map((row) =>
                columns.map((column) =>
                    truncateText(
                        row ? .[column],
                        25
                    )
                )
            );

        const previewColumns =
            columns.length > 8 ?
            columns.slice(0, 8) :
            columns;

        const finalPreviewRows =
            rows
            .slice(0, 20)
            .map((row) =>
                previewColumns.map(
                    (column) =>
                    truncateText(
                        row ? .[column],
                        22
                    )
                )
            );

        if (previewRows.length > 0) {
            autoTable(doc, {
                startY: y,
                head: [
                    previewColumns.map(
                        (column) =>
                        truncateText(
                            column,
                            18
                        )
                    ),
                ],
                body: finalPreviewRows,
                theme: "grid",

                styles: {
                    fontSize: 6,
                    cellPadding: 2,
                    overflow: "linebreak",
                },

                headStyles: {
                    fillColor: [79, 70, 229],
                    textColor: 255,
                    fontStyle: "bold",
                    fontSize: 6,
                },

                alternateRowStyles: {
                    fillColor: [248, 250, 252],
                },

                margin: {
                    left: 10,
                    right: 10,
                },
            });
        } else {
            doc.setFontSize(10);
            doc.setTextColor(MUTED_TEXT);

            doc.text(
                "No data rows available for preview.",
                14,
                y + 10
            );
        }

        // ========================================================
        // CHART 1 — CATEGORY DISTRIBUTION
        // ========================================================

        if (categoryCounts.length > 0) {
            await addChartPage(doc, {
                title: "Category Distribution",
                type: "bar",

                labels: categoryCounts
                    .slice(0, 10)
                    .map((item) =>
                        truncateText(
                            item.label,
                            20
                        )
                    ),

                data: categoryCounts
                    .slice(0, 10)
                    .map(
                        (item) =>
                        item.value
                    ),

                label: "Records",
                colors: COLORS,
                isCurrency: false,
            });
        }

        // ========================================================
        // CHART 2 — REVENUE BY CATEGORY
        // ========================================================

        if (
            salesColumn &&
            categorySales.length > 0
        ) {
            await addChartPage(doc, {
                title: "Revenue by Category",
                type: "bar",

                labels: categorySales
                    .slice(0, 10)
                    .map((item) =>
                        truncateText(
                            item.label,
                            20
                        )
                    ),

                data: categorySales
                    .slice(0, 10)
                    .map(
                        (item) =>
                        Number(
                            item.value.toFixed(
                                2
                            )
                        )
                    ),

                label: "Revenue",
                colors: COLORS,
                isCurrency: true,
            });
        }

        // ========================================================
        // CHART 3 — CATEGORY SHARE
        // ========================================================

        if (categoryCounts.length > 0) {
            await addChartPage(doc, {
                title: "Category Share",
                type: "doughnut",

                labels: categoryCounts
                    .slice(0, 8)
                    .map((item) =>
                        truncateText(
                            item.label,
                            25
                        )
                    ),

                data: categoryCounts
                    .slice(0, 8)
                    .map(
                        (item) =>
                        item.value
                    ),

                label: "Records",
                colors: COLORS,
                isCurrency: false,
            });
        }

        // ========================================================
        // CHART 4 — DATE TREND
        // ========================================================

        if (dateTrend.length > 0) {
            const useRevenue =
                salesColumn &&
                dateTrend.some(
                    (item) =>
                    item.value > 0
                );

            await addChartPage(doc, {
                title: useRevenue ?
                    "Revenue Trend Over Time" :
                    "Records Trend Over Time",

                type: "line",

                labels: dateTrend.map(
                    (item) =>
                    formatDateLabel(
                        item.date
                    )
                ),

                data: dateTrend.map(
                    (item) =>
                    useRevenue ?
                    Number(
                        item.value.toFixed(
                            2
                        )
                    ) :
                    item.count
                ),

                label: useRevenue ?
                    "Revenue" :
                    "Records",

                colors: COLORS,

                isCurrency: useRevenue,
            });
        }

        // ========================================================
        // CHART 5 — CITY DISTRIBUTION
        // ========================================================

        if (cityCounts.length > 0) {
            await addChartPage(doc, {
                title: "Location Distribution",
                type: "bar",

                labels: cityCounts
                    .slice(0, 10)
                    .map((item) =>
                        truncateText(
                            item.label,
                            20
                        )
                    ),

                data: cityCounts
                    .slice(0, 10)
                    .map(
                        (item) =>
                        item.value
                    ),

                label: "Records",
                colors: COLORS,
                isCurrency: false,
            });
        }

        // ========================================================
        // CHART 6 — PRODUCT REVENUE
        // ========================================================

        if (
            salesColumn &&
            productSales.length > 0
        ) {
            await addChartPage(doc, {
                title: "Top Products by Revenue",
                type: "bar",

                labels: productSales
                    .slice(0, 10)
                    .map((item) =>
                        truncateText(
                            item.label,
                            20
                        )
                    ),

                data: productSales
                    .slice(0, 10)
                    .map(
                        (item) =>
                        Number(
                            item.value.toFixed(
                                2
                            )
                        )
                    ),

                label: "Revenue",
                colors: COLORS,
                isCurrency: true,
            });
        }

        // ========================================================
        // FINAL INSIGHTS PAGE
        // ========================================================

        doc.addPage();

        addPageHeader(
            doc,
            "Order Analytics Report"
        );

        y = 30;

        y = addSectionTitle(
            doc,
            "Key Insights",
            y
        );

        const insights = [];

        // Revenue insight

        if (salesColumn) {
            insights.push(
                `Total revenue across the dataset is ₹${formatNumber(
                    totalSales
                )}.`
            );

            if (totalRows > 0) {
                insights.push(
                    `The average revenue per record is ₹${formatNumber(
                        averageOrderValue
                    )}.`
                );
            }
        }

        // Quantity insight

        if (quantityColumn) {
            insights.push(
                `The dataset contains a total quantity of ${formatNumber(
                    totalQuantity
                )}.`
            );
        }

        // Category insight

        if (categoryCounts.length > 0) {
            const topCategory =
                categoryCounts[0];

            insights.push(
                `The largest category by record count is "${truncateText(
                    topCategory.label,
                    40
                )}" with ${formatInteger(
                    topCategory.value
                )} records.`
            );
        }

        // Category revenue insight

        if (categorySales.length > 0) {
            const topRevenueCategory =
                categorySales[0];

            insights.push(
                `The highest-revenue category is "${truncateText(
                    topRevenueCategory.label,
                    40
                )}" with revenue of ₹${formatNumber(
                    topRevenueCategory.value
                )}.`
            );
        }

        // Product insight

        if (productCounts.length > 0) {
            const topProduct =
                productCounts[0];

            insights.push(
                `The most frequently occurring product is "${truncateText(
                    topProduct.label,
                    40
                )}" with ${formatInteger(
                    topProduct.value
                )} records.`
            );
        }

        // Location insight

        if (cityCounts.length > 0) {
            const topLocation =
                cityCounts[0];

            insights.push(
                `The most represented location is "${truncateText(
                    topLocation.label,
                    40
                )}" with ${formatInteger(
                    topLocation.value
                )} records.`
            );
        }

        // Data quality insight

        if (missingValues === 0) {
            insights.push(
                "The dataset contains no missing values."
            );
        } else {
            insights.push(
                `The dataset contains ${formatInteger(
                    missingValues
                )} missing values (${missingPercentage.toFixed(
                    2
                )}% of all cells).`
            );
        }

        if (duplicateRows === 0) {
            insights.push(
                "No duplicate rows were detected."
            );
        } else {
            insights.push(
                `${formatInteger(
                    duplicateRows
                )} duplicate rows were detected.`
            );
        }

        // Date insight

        if (dateTrend.length > 1) {
            const firstDate =
                dateTrend[0].date;

            const lastDate =
                dateTrend[
                    dateTrend.length - 1
                ].date;

            insights.push(
                `The detected date range runs from ${formatDateLabel(
                    firstDate
                )} to ${formatDateLabel(
                    lastDate
                )}.`
            );
        }

        if (insights.length === 0) {
            insights.push(
                "Not enough structured information was detected to generate additional business insights."
            );
        }

        let insightY = y;

        insights.forEach(
            (insight, index) => {
                const bulletX = 18;
                const textX = 25;

                doc.setFillColor(
                    79,
                    70,
                    229
                );

                doc.circle(
                    bulletX,
                    insightY - 1.5,
                    1.5,
                    "F"
                );

                doc.setTextColor(
                    DARK_TEXT
                );

                doc.setFont(
                    "helvetica",
                    "normal"
                );

                doc.setFontSize(10);

                const lines =
                    doc.splitTextToSize(
                        insight,
                        170
                    );

                doc.text(
                    lines,
                    textX,
                    insightY
                );

                insightY +=
                    lines.length * 6 +
                    7;
            }
        );

        // ========================================================
        // FOOTER ON ALL PAGES
        // ========================================================

        const pageCount =
            doc.getNumberOfPages();

        for (
            let page = 1; page <= pageCount; page++
        ) {
            doc.setPage(page);

            doc.setDrawColor(
                229,
                231,
                235
            );

            doc.line(
                14,
                286,
                196,
                286
            );

            doc.setTextColor(
                MUTED_TEXT
            );

            doc.setFontSize(7);
            doc.setFont(
                "helvetica",
                "normal"
            );

            doc.text(
                "Generated by Order Analytics",
                14,
                292
            );

            doc.text(
                `Page ${page} of ${pageCount}`,
                174,
                292
            );
        }

        // ========================================================
        // DOWNLOAD
        // ========================================================

        const dateString =
            new Date()
            .toISOString()
            .split("T")[0];

        doc.save(
            `order-analysis-report-${dateString}.pdf`
        );
    } catch (error) {
        console.error(
            "Final analysis report generation failed:",
            error
        );

        alert(
            "Unable to generate the PDF report. Please check the browser console for details."
        );
    }
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default downloadFinalAnalysisReport;
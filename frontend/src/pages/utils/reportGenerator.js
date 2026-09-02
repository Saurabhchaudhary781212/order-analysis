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
} from "chart.js";


// ======================================================
// REGISTER CHART.JS
// ======================================================

Chart.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Tooltip,
    Legend
);


// ======================================================
// FIND COLUMN
// ======================================================

const findColumn = (columns, keywords) => {
    return columns.find((column) => {
        const name = String(column).toLowerCase();

        return keywords.some((keyword) =>
            name.includes(keyword)
        );
    });
};


// ======================================================
// CREATE CHART IMAGE
// ======================================================

const createChartImage = ({
    type,
    labels,
    data,
    label,
}) => {

    return new Promise((resolve) => {

        const canvas =
            document.createElement("canvas");

        canvas.width = 1000;
        canvas.height = 500;

        canvas.style.position = "fixed";
        canvas.style.left = "-10000px";
        canvas.style.top = "-10000px";

        document.body.appendChild(canvas);


        const chart = new Chart(
            canvas.getContext("2d"), {
                type,

                data: {
                    labels,

                    datasets: [{
                        label,

                        data,

                        borderWidth: 2,

                        tension: 0.3,
                    }, ],
                },

                options: {
                    responsive: false,

                    animation: false,

                    plugins: {
                        legend: {
                            display: true,
                            position: "bottom",
                        },
                    },

                    scales: type === "doughnut" ?
                        {} :
                        {
                            x: {
                                ticks: {
                                    autoSkip: false,
                                },
                            },

                            y: {
                                beginAtZero: true,
                            },
                        },
                },
            }
        );


        // Give Chart.js a moment to render
        setTimeout(() => {

            const image =
                canvas.toDataURL(
                    "image/png",
                    1
                );


            chart.destroy();

            document.body.removeChild(
                canvas
            );


            resolve(image);

        }, 100);

    });
};


// ======================================================
// DOWNLOAD FINAL REPORT
// ======================================================

export const downloadFinalAnalysisReport =
    async() => {

        // ==================================================
        // GET DATA FROM SESSION STORAGE
        // ==================================================

        const savedDataset =
            sessionStorage.getItem(
                "dataset"
            );


        if (!savedDataset) {

            alert(
                "No analysis data found. Please upload and analyze a file first."
            );

            return;

        }


        let dataset;


        try {

            dataset =
                JSON.parse(
                    savedDataset
                );

        } catch (error) {

            console.error(
                "Dataset parsing error:",
                error
            );

            alert(
                "Unable to read analysis data."
            );

            return;

        }


        // ==================================================
        // GET COMBINED DATA
        // ==================================================

        const combinedData =
            dataset ? .combined_data || {};


        const rows =
            combinedData.rows || [];


        const columns =
            combinedData.columns || [];


        if (
            rows.length === 0 ||
            columns.length === 0
        ) {

            alert(
                "No analyzed data is available."
            );

            return;

        }


        // ==================================================
        // SUMMARY
        // ==================================================

        const summary =
            dataset ? .summary || {};


        const totalRows =
            summary.total_rows ? ?
            rows.length;


        const totalColumns =
            summary.total_columns ? ?
            columns.length;


        const totalFiles =
            summary.total_files ? ?
            dataset ? .files ? .length ? ?
            0;


        // ==================================================
        // DETECT COLUMNS
        // ==================================================

        const salesColumn =
            findColumn(
                columns, [
                    "sales",
                    "sale",
                    "revenue",
                    "amount",
                    "price",
                    "income",
                    "total",
                    "value",
                ]
            );


        const quantityColumn =
            findColumn(
                columns, [
                    "quantity",
                    "qty",
                    "units",
                ]
            );


        const categoryColumn =
            findColumn(
                columns, [
                    "category",
                    "product",
                    "type",
                    "item",
                    "department",
                ]
            );


        const dateColumn =
            findColumn(
                columns, [
                    "date",
                    "time",
                    "month",
                    "year",
                    "created",
                    "order_date",
                ]
            );


        // ==================================================
        // NUMERIC COLUMNS
        // ==================================================

        const numericColumns =
            columns.filter(
                (column) => {

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
                            value !== ""
                        );


                    if (
                        values.length === 0
                    ) {
                        return false;
                    }


                    return values.every(
                        (value) =>
                        !isNaN(
                            Number(value)
                        )
                    );

                }
            );


        // ==================================================
        // MISSING VALUES
        // ==================================================

        let missingValues = 0;


        rows.forEach(
            (row) => {

                columns.forEach(
                    (column) => {

                        const value =
                            row[column];


                        if (
                            value === null ||
                            value === undefined ||
                            value === ""
                        ) {

                            missingValues++;

                        }

                    }
                );

            }
        );


        // ==================================================
        // DUPLICATE ROWS
        // ==================================================

        const uniqueRows =
            new Set(
                rows.map(
                    (row) =>
                    JSON.stringify(row)
                )
            );


        const duplicateRows =
            rows.length -
            uniqueRows.size;


        // ==================================================
        // SALES
        // ==================================================

        let totalSales = 0;


        if (salesColumn) {

            totalSales =
                rows.reduce(
                    (
                        total,
                        row
                    ) => {

                        const value =
                            Number(
                                row[
                                    salesColumn
                                ]
                            );


                        return (
                            total +
                            (
                                isNaN(value) ?
                                0 :
                                value
                            )
                        );

                    },
                    0
                );

        }


        // ==================================================
        // QUANTITY
        // ==================================================

        let totalQuantity = 0;


        if (quantityColumn) {

            totalQuantity =
                rows.reduce(
                    (
                        total,
                        row
                    ) => {

                        const value =
                            Number(
                                row[
                                    quantityColumn
                                ]
                            );


                        return (
                            total +
                            (
                                isNaN(value) ?
                                0 :
                                value
                            )
                        );

                    },
                    0
                );

        }


        // ==================================================
        // CATEGORY DATA
        // ==================================================

        const categoryCounts = {};


        if (categoryColumn) {

            rows.forEach(
                (row) => {

                    const category =
                        row[
                            categoryColumn
                        ];


                    if (
                        category !== null &&
                        category !== undefined &&
                        category !== ""
                    ) {

                        const key =
                            String(
                                category
                            );


                        categoryCounts[key] =
                            (
                                categoryCounts[key] ||
                                0
                            ) + 1;

                    }

                }
            );

        }


        const sortedCategories =
            Object.entries(
                categoryCounts
            )
            .sort(
                (a, b) =>
                b[1] - a[1]
            );


        // ==================================================
        // DATE DATA
        // ==================================================

        const dateCounts = {};


        if (dateColumn) {

            rows.forEach(
                (row) => {

                    const value =
                        row[
                            dateColumn
                        ];


                    if (
                        value === null ||
                        value === undefined ||
                        value === ""
                    ) {

                        return;

                    }


                    const date =
                        new Date(value);


                    if (!isNaN(
                            date.getTime()
                        )) {

                        const label =
                            date
                            .toISOString()
                            .slice(
                                0,
                                10
                            );


                        dateCounts[label] =
                            (
                                dateCounts[label] ||
                                0
                            ) + 1;

                    }

                }
            );

        }


        const sortedDates =
            Object.entries(
                dateCounts
            )
            .sort(
                (a, b) =>
                new Date(a[0]) -
                new Date(b[0])
            );


        // ==================================================
        // CREATE PDF
        // ==================================================

        const doc =
            new jsPDF(
                "p",
                "mm",
                "a4"
            );


        // ==================================================
        // TITLE
        // ==================================================

        doc.setFontSize(
            22
        );

        doc.setFont(
            "helvetica",
            "bold"
        );


        doc.text(
            "Order Analytics",
            14,
            20
        );


        doc.setFontSize(
            16
        );


        doc.text(
            "Final Analysis Report",
            14,
            29
        );


        doc.setFontSize(
            9
        );

        doc.setFont(
            "helvetica",
            "normal"
        );


        doc.text(
            `Generated: ${new Date().toLocaleString()}`,
            14,
            36
        );


        // ==================================================
        // ANALYSIS SUMMARY
        // ==================================================

        doc.setFontSize(
            16
        );

        doc.setFont(
            "helvetica",
            "bold"
        );


        doc.text(
            "Analysis Summary",
            14,
            48
        );


        autoTable(
            doc, {

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

            }
        );


        // ==================================================
        // BUSINESS METRICS
        // ==================================================

        let businessY =
            doc.lastAutoTable.finalY +
            12;


        doc.setFontSize(
            16
        );

        doc.setFont(
            "helvetica",
            "bold"
        );


        doc.text(
            "Business Metrics",
            14,
            businessY
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
                    undefined, {
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
                    categoryCounts
                ).length,
            ]);

        }


        if (dateColumn) {

            businessRows.push([
                "Date Column",
                dateColumn,
            ]);

        }


        if (
            businessRows.length > 0
        ) {

            autoTable(
                doc, {

                    startY: businessY + 6,

                    head: [
                        [
                            "Metric",
                            "Value",
                        ],
                    ],

                    body: businessRows,

                    theme: "grid",

                }
            );

        }


        // ==================================================
        // CHART 1 - CATEGORY BAR
        // ==================================================

        if (
            sortedCategories.length > 0
        ) {

            const labels =
                sortedCategories
                .slice(
                    0,
                    10
                )
                .map(
                    ([category]) =>
                    category
                );


            const values =
                sortedCategories
                .slice(
                    0,
                    10
                )
                .map(
                    ([, count]) =>
                    count
                );


            const image =
                await createChartImage({
                    type: "bar",
                    labels,
                    data: values,
                    label: "Records",
                });


            doc.addPage();


            doc.setFontSize(
                18
            );

            doc.setFont(
                "helvetica",
                "bold"
            );


            doc.text(
                "Category Distribution",
                14,
                20
            );


            doc.setFontSize(
                9
            );

            doc.setFont(
                "helvetica",
                "normal"
            );


            doc.text(
                `Category column: ${categoryColumn}`,
                14,
                28
            );


            doc.addImage(
                image,
                "PNG",
                14,
                38,
                180,
                90
            );

        }


        // ==================================================
        // CHART 2 - DATE LINE
        // ==================================================

        if (
            sortedDates.length > 0
        ) {

            const labels =
                sortedDates.map(
                    ([date]) =>
                    date
                );


            const values =
                sortedDates.map(
                    ([, count]) =>
                    count
                );


            const image =
                await createChartImage({
                    type: "line",
                    labels,
                    data: values,
                    label: "Records",
                });


            doc.addPage();


            doc.setFontSize(
                18
            );

            doc.setFont(
                "helvetica",
                "bold"
            );


            doc.text(
                "Data Trend Over Time",
                14,
                20
            );


            doc.setFontSize(
                9
            );

            doc.setFont(
                "helvetica",
                "normal"
            );


            doc.text(
                `Date column: ${dateColumn}`,
                14,
                28
            );


            doc.addImage(
                image,
                "PNG",
                14,
                38,
                180,
                90
            );

        }


        // ==================================================
        // CHART 3 - DOUGHNUT
        // ==================================================

        if (
            sortedCategories.length > 0
        ) {

            const labels =
                sortedCategories
                .slice(
                    0,
                    8
                )
                .map(
                    ([category]) =>
                    category
                );


            const values =
                sortedCategories
                .slice(
                    0,
                    8
                )
                .map(
                    ([, count]) =>
                    count
                );


            const image =
                await createChartImage({
                    type: "doughnut",
                    labels,
                    data: values,
                    label: "Category Share",
                });


            doc.addPage();


            doc.setFontSize(
                18
            );

            doc.setFont(
                "helvetica",
                "bold"
            );


            doc.text(
                "Category Share",
                14,
                20
            );


            doc.setFontSize(
                9
            );

            doc.setFont(
                "helvetica",
                "normal"
            );


            doc.text(
                `Category column: ${categoryColumn}`,
                14,
                28
            );


            doc.addImage(
                image,
                "PNG",
                25,
                40,
                160,
                120
            );

        }


        // ==================================================
        // NUMERIC ANALYSIS
        // ==================================================

        doc.addPage();


        doc.setFontSize(
            18
        );

        doc.setFont(
            "helvetica",
            "bold"
        );


        doc.text(
            "Numeric Column Analysis",
            14,
            20
        );


        const numericStatistics =
            numericColumns.map(
                (column) => {

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
                        );


                    if (
                        values.length === 0
                    ) {
                        return null;
                    }


                    const total =
                        values.reduce(
                            (
                                sum,
                                value
                            ) =>
                            sum + value,
                            0
                        );


                    const average =
                        total /
                        values.length;


                    return [
                        column,

                        total.toLocaleString(
                            undefined, {
                                maximumFractionDigits: 2,
                            }
                        ),

                        average.toLocaleString(
                            undefined, {
                                maximumFractionDigits: 2,
                            }
                        ),

                        Math.min(
                            ...values
                        ).toLocaleString(),

                        Math.max(
                            ...values
                        ).toLocaleString(),
                    ];

                }
            )
            .filter(Boolean);


        if (
            numericStatistics.length > 0
        ) {

            autoTable(
                doc, {

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

                    body: numericStatistics,

                    theme: "grid",

                    styles: {
                        fontSize: 8,
                    },

                }
            );

        }


        // ==================================================
        // CATEGORY TABLE
        // ==================================================

        if (
            sortedCategories.length > 0
        ) {

            doc.addPage();


            doc.setFontSize(
                18
            );

            doc.setFont(
                "helvetica",
                "bold"
            );


            doc.text(
                "Category Analysis",
                14,
                20
            );


            autoTable(
                doc, {

                    startY: 28,

                    head: [
                        [
                            "Category",
                            "Records",
                        ],
                    ],

                    body: sortedCategories.map(
                        ([category, count]) => [
                            category,
                            count,
                        ]
                    ),

                    theme: "grid",

                }
            );

        }


        // ==================================================
        // DATA PREVIEW
        // ==================================================

        doc.addPage();


        doc.setFontSize(
            18
        );

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
            .slice(
                0,
                50
            )
            .map(
                (row) =>
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


                        return String(
                            value
                        );

                    }
                )
            );


        autoTable(
            doc, {

                startY: 28,

                head: [
                    columns,
                ],

                body: previewRows,

                theme: "grid",

                styles: {
                    fontSize: 5.5,
                },

                headStyles: {
                    fontSize: 6,
                    fontStyle: "bold",
                },

            }
        );


        // ==================================================
        // FINAL INSIGHTS
        // ==================================================

        doc.addPage();


        doc.setFontSize(
            18
        );

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
            `The dataset contains ${totalRows} records and ${totalColumns} columns.`
        );


        insights.push(
            `${totalFiles} file(s) were analyzed.`
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
                `Total sales/revenue: ${totalSales.toLocaleString(
          undefined,
          {
            maximumFractionDigits: 2,
          }
        )}.`
            );

        }


        if (quantityColumn) {

            insights.push(
                `Total quantity: ${totalQuantity.toLocaleString()}.`
            );

        }


        if (categoryColumn) {

            insights.push(
                `${Object.keys(categoryCounts).length} unique categories were identified.`
            );

        }


        let insightY = 32;


        doc.setFontSize(
            11
        );

        doc.setFont(
            "helvetica",
            "normal"
        );


        insights.forEach(
            (
                insight,
                index
            ) => {

                const text =
                    `${index + 1}. ${insight}`;


                const wrapped =
                    doc.splitTextToSize(
                        text,
                        180
                    );


                doc.text(
                    wrapped,
                    14,
                    insightY
                );


                insightY +=
                    wrapped.length *
                    6 +
                    5;

            }
        );


        // ==================================================
        // FOOTER
        // ==================================================

        const pageCount =
            doc.internal.getNumberOfPages();


        for (
            let i = 1; i <= pageCount; i++
        ) {

            doc.setPage(i);


            doc.setFontSize(
                8
            );

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


        // ==================================================
        // DOWNLOAD
        // ==================================================

        doc.save(
            "Order_Analytics_Final_Report.pdf"
        );

    };
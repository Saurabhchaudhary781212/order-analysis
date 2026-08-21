from flask import Blueprint, request, jsonify

import pandas as pd
import json
import xml.etree.ElementTree as ET
import os


# =====================================================
# DATA BLUEPRINT
# =====================================================

data_bp = Blueprint(
    "data",
    __name__
)


# =====================================================
# CSV
# =====================================================

def analyze_csv(file):

    df = pd.read_csv(file)

    return analyze_dataframe(df)


# =====================================================
# JSON
# =====================================================

def analyze_json(file):

    data = json.load(file)


    if isinstance(data, dict):

        if (
            "data" in data
            and isinstance(data["data"], list)
        ):

            data = data["data"]

        else:

            data = [data]


    elif not isinstance(data, list):

        data = [data]


    df = pd.DataFrame(data)

    return analyze_dataframe(df)


# =====================================================
# XML
# =====================================================

def analyze_xml(file):

    tree = ET.parse(file)

    root = tree.getroot()

    rows = []


    for element in root:

        row = {}


        for child in element:

            row[child.tag] = child.text


        rows.append(row)


    df = pd.DataFrame(rows)

    return analyze_dataframe(df)


# =====================================================
# DATAFRAME ANALYSIS
# =====================================================

def analyze_dataframe(df):

    if df is None:

        return {
            "rows": 0,
            "columns": 0,
            "column_names": [],
            "missing_values": 0,
            "duplicates": 0,
            "data_types": {},
            "preview": []
        }


    # Clean column names

    df.columns = [
        str(column).strip()
        for column in df.columns
    ]


    # Missing values

    missing_values = int(
        df.isnull().sum().sum()
    )


    # Duplicate rows

    duplicate_rows = int(
        df.duplicated().sum()
    )


    # Columns

    columns = list(
        df.columns
    )


    # Data types

    data_types = {}

    for column in df.columns:

        data_types[column] = str(
            df[column].dtype
        )


    # Preview

    preview_df = df.head(10).copy()


    preview_df = preview_df.where(
        pd.notnull(preview_df),
        None
    )


    preview = preview_df.to_dict(
        orient="records"
    )


    return {

        "rows": int(
            len(df)
        ),

        "columns": int(
            len(df.columns)
        ),

        "column_names": columns,

        "missing_values":
            missing_values,

        "duplicates":
            duplicate_rows,

        "data_types":
            data_types,

        "preview":
            preview
    }


# =====================================================
# MULTIPLE FILE ANALYSIS
# =====================================================

@data_bp.route(
    "/analyze",
    methods=["POST"]
)
def analyze_files():

    # -------------------------------------------------
    # Check files
    # -------------------------------------------------

    if "files" not in request.files:

        return jsonify({

            "success": False,

            "message":
                "No files uploaded"

        }), 400


    files = request.files.getlist(
        "files"
    )


    if not files:

        return jsonify({

            "success": False,

            "message":
                "No files selected"

        }), 400


    # -------------------------------------------------
    # Variables
    # -------------------------------------------------

    results = []

    all_rows = []

    all_columns = set()

    total_rows = 0

    total_columns = 0

    total_missing = 0

    total_duplicates = 0

    successful_files = 0

    failed_files = 0


    # -------------------------------------------------
    # Process every file
    # -------------------------------------------------

    for file in files:

        filename = file.filename


        if not filename:

            continue


        extension = os.path.splitext(
            filename
        )[1].lower()


        try:

            # CSV

            if extension == ".csv":

                analysis = analyze_csv(
                    file
                )


            # JSON

            elif extension == ".json":

                analysis = analyze_json(
                    file
                )


            # XML

            elif extension == ".xml":

                analysis = analyze_xml(
                    file
                )


            # Unsupported

            else:

                failed_files += 1

                results.append({

                    "filename":
                        filename,

                    "file_type":
                        extension.replace(
                            ".",
                            ""
                        ).upper(),

                    "error":
                        "Unsupported file type. "
                        "Only CSV, JSON and XML "
                        "files are supported."

                })

                continue


            # -------------------------------------------------
            # File result
            # -------------------------------------------------

            file_result = {

                "filename":
                    filename,

                "file_type":
                    extension.replace(
                        ".",
                        ""
                    ).upper(),

                **analysis

            }


            results.append(
                file_result
            )


            # -------------------------------------------------
            # Summary
            # -------------------------------------------------

            total_rows += analysis[
                "rows"
            ]


            total_columns = max(
                total_columns,
                analysis["columns"]
            )


            total_missing += analysis[
                "missing_values"
            ]


            total_duplicates += analysis[
                "duplicates"
            ]


            # -------------------------------------------------
            # Columns
            # -------------------------------------------------

            for column in analysis[
                "column_names"
            ]:

                all_columns.add(
                    column
                )


            # -------------------------------------------------
            # Preview rows
            # -------------------------------------------------

            for row in analysis[
                "preview"
            ]:

                all_rows.append(
                    row
                )


            successful_files += 1


        except Exception as error:

            failed_files += 1

            results.append({

                "filename":
                    filename,

                "file_type":
                    extension.replace(
                        ".",
                        ""
                    ).upper(),

                "error":
                    str(error)

            })


    # -------------------------------------------------
    # No successful files
    # -------------------------------------------------

    if successful_files == 0:

        return jsonify({

            "success": False,

            "message":
                "No valid files could be analyzed.",

            "results":
                results

        }), 400


    # -------------------------------------------------
    # Final response
    # -------------------------------------------------

    return jsonify({

        "success": True,

        "message":
            "Files analyzed successfully",


        "summary": {

            "files":
                successful_files,

            "failed_files":
                failed_files,

            "rows":
                total_rows,

            "columns":
                total_columns,

            "missing_values":
                total_missing,

            "duplicates":
                total_duplicates

        },


        "combined_data": {

            "rows":
                all_rows,

            "columns":
                list(all_columns)

        },


        "results":
            results

    })
from flask import Blueprint, request, jsonify
import pandas as pd
import json
import xml.etree.ElementTree as ET
import io
from routes.analyze_routes import analyze_bp


analyze_bp = Blueprint("analyze", __name__)


@analyze_bp.route("/api/analyze", methods=["POST"])
def analyze():

    try:

        # -----------------------------------------
        # CHECK FILES
        # -----------------------------------------

        files = request.files.getlist("files")

        if not files:
            return jsonify({
                "success": False,
                "message": "No files uploaded"
            }), 400


        results = []
        all_dataframes = []


        # -----------------------------------------
        # PROCESS EACH FILE
        # -----------------------------------------

        for file in files:

            filename = file.filename

            if not filename:
                continue

            extension = filename.rsplit(".", 1)[-1].lower()


            # =====================================
            # CSV
            # =====================================

            if extension == "csv":

                df = pd.read_csv(file)

                rows = df.fillna("").to_dict(
                    orient="records"
                )

                columns = df.columns.tolist()


            # =====================================
            # JSON
            # =====================================

            elif extension == "json":

                content = file.read()

                data = json.loads(
                    content.decode("utf-8")
                )


                if isinstance(data, list):

                    df = pd.DataFrame(data)

                elif isinstance(data, dict):

                    # Try to find list inside JSON
                    list_data = None

                    for value in data.values():

                        if isinstance(value, list):
                            list_data = value
                            break

                    if list_data is not None:
                        df = pd.DataFrame(list_data)

                    else:
                        df = pd.DataFrame([data])

                else:

                    df = pd.DataFrame()


                rows = df.fillna("").to_dict(
                    orient="records"
                )

                columns = df.columns.tolist()


            # =====================================
            # XML
            # =====================================

            elif extension == "xml":

                content = file.read()

                root = ET.fromstring(
                    content
                )

                records = []

                for child in root:

                    record = {}

                    for element in child:
                        record[element.tag] = element.text

                    if record:
                        records.append(record)


                df = pd.DataFrame(records)

                rows = df.fillna("").to_dict(
                    orient="records"
                )

                columns = df.columns.tolist()


            # =====================================
            # INVALID FILE
            # =====================================

            else:

                return jsonify({
                    "success": False,
                    "message": f"Unsupported file type: {filename}"
                }), 400


            # -----------------------------------------
            # STORE DATAFRAME
            # -----------------------------------------

            all_dataframes.append(df)


            # -----------------------------------------
            # BASIC SUMMARY
            # -----------------------------------------

            summary = {
                "rows": len(df),
                "columns": len(df.columns),
                "column_names": columns
            }


            results.append({

                "filename": filename,

                "rows": rows,

                "columns": columns,

                "summary": summary

            })


        # -----------------------------------------
        # COMBINE DATA
        # -----------------------------------------

        if all_dataframes:

            combined_df = pd.concat(
                all_dataframes,
                ignore_index=True,
                sort=False
            )

            combined_data = {
                "rows": combined_df.fillna("").to_dict(
                    orient="records"
                ),

                "columns": combined_df.columns.tolist()
            }

        else:

            combined_data = {
                "rows": [],
                "columns": []
            }


        # -----------------------------------------
        # FINAL SUMMARY
        # -----------------------------------------

        total_rows = sum(
            len(df)
            for df in all_dataframes
        )

        total_columns = len(
            combined_data["columns"]
        )


        summary = {

            "total_files": len(results),

            "total_rows": total_rows,

            "total_columns": total_columns,

            "columns": combined_data["columns"]

        }


        # -----------------------------------------
        # RETURN JSON
        # -----------------------------------------

        return jsonify({

            "success": True,

            "message": "Files analyzed successfully",

            "results": results,

            "combined_data": combined_data,

            "summary": summary

        }), 200


    except Exception as e:

        print("ANALYZE ERROR:", str(e))

        return jsonify({

            "success": False,

            "message": str(e)

        }), 500
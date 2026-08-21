import json
import pandas as pd
import xml.etree.ElementTree as ET


# ==========================================
# COLUMN CLEANING
# ==========================================

def clean_column_name(column):
    """
    Convert column names into a consistent format.
    """

    column = str(column)

    column = column.strip()

    column = column.lower()

    column = column.replace(" ", "_")

    column = column.replace("-", "_")

    column = column.replace("/", "_")

    return column


# ==========================================
# NORMALIZE DATAFRAME
# ==========================================

def normalize_dataframe(df):
    """
    Clean and normalize a dataframe.
    """

    if df is None:
        return pd.DataFrame()

    df = df.copy()

    # Clean column names
    df.columns = [
        clean_column_name(column)
        for column in df.columns
    ]

    # Remove completely empty columns
    df = df.dropna(
        axis=1,
        how="all"
    )

    # Remove completely empty rows
    df = df.dropna(
        axis=0,
        how="all"
    )

    # Replace NaN with None
    df = df.where(
        pd.notnull(df),
        None
    )

    return df


# ==========================================
# CSV
# ==========================================

def csv_to_dataframe(file):

    try:

        df = pd.read_csv(file)

        return normalize_dataframe(df)

    except Exception as error:

        raise ValueError(
            f"Unable to read CSV file: {error}"
        )


# ==========================================
# JSON
# ==========================================

def json_to_dataframe(file):

    try:

        content = file.read()

        if isinstance(content, bytes):
            content = content.decode(
                "utf-8"
            )

        data = json.loads(content)

        # List of objects
        if isinstance(data, list):

            return normalize_dataframe(
                pd.json_normalize(data)
            )

        # Object containing a list
        if isinstance(data, dict):

            list_value = None

            for value in data.values():

                if isinstance(value, list):

                    list_value = value

                    break

            if list_value is not None:

                return normalize_dataframe(
                    pd.json_normalize(
                        list_value
                    )
                )

            # Single object
            return normalize_dataframe(
                pd.json_normalize([data])
            )

        raise ValueError(
            "Unsupported JSON structure."
        )

    except Exception as error:

        raise ValueError(
            f"Unable to read JSON file: {error}"
        )


# ==========================================
# XML
# ==========================================

def xml_to_dataframe(file):

    try:

        content = file.read()

        if isinstance(content, bytes):
            content = content.decode(
                "utf-8"
            )

        root = ET.fromstring(content)

        rows = []

        # Look for repeated child elements
        children = list(root)

        if not children:

            return pd.DataFrame()

        for child in children:

            row = {}

            # Attributes
            for key, value in child.attrib.items():

                row[key] = value

            # Child elements
            for element in child:

                row[element.tag] = (
                    element.text
                )

            if row:
                rows.append(row)

        # If normal structure worked
        if rows:

            return normalize_dataframe(
                pd.DataFrame(rows)
            )

        # Fallback
        row = {}

        for element in root.iter():

            if element.text:
                row[element.tag] = (
                    element.text.strip()
                )

        return normalize_dataframe(
            pd.DataFrame([row])
        )

    except Exception as error:

        raise ValueError(
            f"Unable to read XML file: {error}"
        )


# ==========================================
# PROCESS FILE
# ==========================================

def process_file(file):

    filename = (
        file.filename
        .lower()
        .strip()
    )

    if filename.endswith(".csv"):

        return csv_to_dataframe(file)

    if filename.endswith(".json"):

        return json_to_dataframe(file)

    if filename.endswith(".xml"):

        return xml_to_dataframe(file)

    raise ValueError(
        "Only CSV, JSON and XML files are supported."
    )


# ==========================================
# DATA TYPES
# ==========================================

def detect_data_types(df):

    result = {}

    for column in df.columns:

        series = df[column]

        if pd.api.types.is_numeric_dtype(
            series
        ):

            result[column] = "numeric"

        elif pd.api.types.is_datetime64_any_dtype(
            series
        ):

            result[column] = "date"

        else:

            result[column] = "text"

    return result


# ==========================================
# NUMERIC STATISTICS
# ==========================================

def calculate_numeric_statistics(df):

    statistics = {}

    numeric_columns = df.select_dtypes(
        include="number"
    ).columns

    for column in numeric_columns:

        series = df[column].dropna()

        if len(series) == 0:
            continue

        statistics[column] = {

            "sum": float(
                series.sum()
            ),

            "average": float(
                series.mean()
            ),

            "minimum": float(
                series.min()
            ),

            "maximum": float(
                series.max()
            ),

            "count": int(
                series.count()
            ),

        }

    return statistics


# ==========================================
# MISSING VALUES
# ==========================================

def calculate_missing_values(df):

    missing = {}

    for column in df.columns:

        count = int(
            df[column].isna().sum()
        )

        missing[column] = count

    return missing


# ==========================================
# DUPLICATES
# ==========================================

def calculate_duplicate_count(df):

    return int(
        df.duplicated().sum()
    )


# ==========================================
# DATAFRAME TO JSON
# ==========================================

def dataframe_to_response(df):

    df = normalize_dataframe(df)

    records = df.to_dict(
        orient="records"
    )

    columns = list(
        df.columns
    )

    return {

        "columns": columns,

        "rows": records,

        "row_count": len(df),

        "column_count":
            len(columns),

        "data_types":
            detect_data_types(df),

        "missing_values":
            calculate_missing_values(df),

        "duplicate_rows":
            calculate_duplicate_count(df),

        "numeric_statistics":
            calculate_numeric_statistics(df),

    }
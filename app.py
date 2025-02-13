from flask import Flask, jsonify, request
from flask_cors import CORS
import json
from datetime import datetime, timedelta
import base64
import re
import random

from collections import defaultdict
from decimal import Decimal



app = Flask(__name__)
CORS(app)  # This will allow all domains

# TODO: os.environ["IGNITION_DB_PASSWORD"]
import mysql.connector as msc

from dbconnector import IGNITION_DB_CLUSTER
from dbconnector import FETCH_COA_QUERY

from ingest import ingest, ingest2, ingest3

PRODUCTION_MATRIX = {}



def fetch(query, params=None, validation=None):
    # fetch rows from ignition db
    try:
        cnx = msc.connect(**IGNITION_DB_CLUSTER)
        cursor = cnx.cursor()

        cursor.execute(query, params)

        columns = [desc[0] for desc in cursor.description]  # Get column names
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
   
    # standard exceptions
    except msc.Error as e:
        print(f"MySQL Error: {e}")
        return None
   
    except Exception as e:
            print(f"General Error querying database: {e}")
            return None
    
    # close connection
    finally:
        try:
            if cursor:
                cursor.close()
            if cnx:
                cnx.close()
        
        except UnboundLocalError:
            pass

def validate_date(start_date, end_date):
    if not start_date or not end_date: 
        return jsonify({"error" : "start_date and end_Date are required"}), 400

    try:
        start_date = datetime.strptime(start_date, "%Y-%m-%d")
        end_date = datetime.strptime(end_date, "%Y-%m-%d")
        return start_date, end_date
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector as msc
from datetime import datetime, timedelta
from collections import defaultdict

# Assuming fetch is a function that executes SQL queries and returns results

@app.route("/api/view", methods=["GET"])
def get_view():
    """Renders the monthly schedule & attainment on the /view page"""
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    
    if not start_date or not end_date:
        return jsonify({"error": "start_date and end_date are required"}), 400
    
    try:
        start_date = datetime.strptime(start_date, '%Y-%m-%d')
        end_date = datetime.strptime(end_date, '%Y-%m-%d')
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400
    

    # Adjust end_date to be inclusive
    end_date += timedelta(days=1)

    # GET PRODUCTION SCHEDULE
    query_production_schedule = """
    SELECT
        DATE_FORMAT(date, '%Y-%m-%d') as date,
        shift,
        line,
        material_id
    FROM
        production_schedule
    WHERE date >= %s
    AND date < %s
    """
    params_production_schedule = (start_date, end_date)
    data_production_schedule = fetch(query_production_schedule, params_production_schedule)

    # GET PRODUCTION GOALS
    query_production_goals = """
    SELECT
        DATE_FORMAT(date, '%Y-%m-%d') as date,
        material_id,
        goal
    FROM
        production_goals
    WHERE date >= %s
    AND date < %s    

    """
    params_production_goals = (start_date, end_date)
    data_production_goals = fetch(query_production_goals, params_production_goals)

    # GET COMPOUNDING DATA
    query_compounding_lots = """
    SELECT
        DATE_FORMAT(created_at, '%Y-%m-%d') as date,
        c.material_id,
        SUM(c.mass) AS total_mass,
        s.shift AS shift
    FROM compounding_lots c
    JOIN shift_translation s
    ON TIME(c.created_at) >= s.start_time
    AND (TIME(c.created_at) < s.end_time OR (s.shift = 3 AND s.end_time = '00:00:00'))
    WHERE c.created_at >= %s
    AND c.created_at < %s
    GROUP BY date, material_id, shift
    ORDER BY date, shift    

    """
    params_compounding_lots = (start_date, end_date)
    data_compounding_lots = fetch(query_compounding_lots, params_compounding_lots)

    # GET EXTRUSION DATA
    query_extrusion_runs = """
    SELECT
        DATE_FORMAT(e.start_time, '%Y-%m-%d') as date,
        line_id,
        material_id,
        COUNT(CASE WHEN spool_id IS NOT NULL and status = 0 THEN 1 ELSE 0 END) as gs,
        s.shift as shift
    FROM
        extrusion_runs e
    JOIN shift_translation s
    ON TIME(e.start_time) >= s.start_time
    AND (TIME(e.start_time) < s.end_time OR (s.shift = 3 AND s.end_time = '00:00:00'))
    WHERE e.start_time >= %s
    AND e.start_time < %s
    GROUP BY
        date, shift, line_id, material_id
    ORDER BY
        date, shift, line_id, material_id    

    """
    params_extrusion_runs = (start_date, end_date)
    data_extrusion_runs = fetch(query_extrusion_runs, params_extrusion_runs)

    # GET FIBER DATA
    query_production_spools = """
    WITH line_runtime AS (
    SELECT
        DATE(l.start_time) AS run_date,
        l.material_id,
        l.line_id,
        s.shift AS shift
    FROM production_spools l
    JOIN shift_translation s
    ON TIME(l.start_time) >= s.start_time
    AND (TIME(l.start_time) < s.end_time OR (s.shift = 3 AND s.end_time = '00:00:00'))
    )
    SELECT
        DATE_FORMAT(run_date, '%Y-%m-%d') as date,
        material_id,
        shift,
        COUNT(DISTINCT line_id) AS running_lines
    FROM line_runtime
    WHERE run_date >= %s AND run_date < %s
    GROUP BY run_date, material_id, shift
    ORDER BY run_date, shift  

    """
    params_production_spools = (start_date, end_date)
    data_production_spools = fetch(query_production_spools, params_production_spools)


    # process fiber data ->
    # transformed_data = []
    
    # for entry in data_production_schedule:
    #     if entry["line"] == "FIBR":
    #         materials = entry["material_id"].split()
            
    #         for material in materials:
    #             match = re.match(r"(\d+)?([A-Z]+)", material)
    #             if match:
    #                 goal, material_id = match.groups()
    #                 if goal:  # Only include if a numeric goal exists
    #                     transformed_data.append({
    #                         "date": entry["date"],
    #                         "line": entry["line"],
    #                         "material_id": material_id,
    #                         "shift": entry["shift"],
    #                         "goal": int(goal)
    #                     })
    
    # data_production_schedule[:] = transformed_data

    net_data_json = {
        "schedule": data_production_schedule,
        "goals": data_production_goals,
        "compounding": data_compounding_lots,
        "extrusion": data_extrusion_runs,
        "fiber": data_production_spools
    }




    # Initialize structured dictionary
    structured_data = defaultdict(lambda: defaultdict(lambda: {
        "compounding": defaultdict(lambda: {"scheduled": {}, "unscheduled": {}}),
        "extrusion": defaultdict(lambda: {"scheduled": {}, "unscheduled": {}}),
        "fiber": defaultdict(lambda: {"scheduled": {}, "unscheduled": {}})
    }))
    
    # Convert schedule into an easy lookup
    scheduled_map = defaultdict(lambda: defaultdict(set))
    for entry in data_production_schedule:
        scheduled_map[entry["date"]][entry["shift"]].add(entry["material_id"])
    
    # Convert goals into an easy lookup
    goal_map = {goal["material_id"]: goal["goal"] for goal in data_production_goals}
    
    # Process compounding data
    for entry in data_compounding_lots:
        date_key, shift, material_id = entry["date"], entry["shift"], entry["material_id"]
        compounding_type = "scheduled" if material_id in scheduled_map[date_key][shift] else "unscheduled"
        structured_data[date_key][shift]["compounding"]["CMP0"][compounding_type][material_id] = {
            "goal": goal_map.get(material_id, ""),
            "produced": entry["total_mass"],
        }
    
    # Process extrusion data
    for entry in data_extrusion_runs:
        date_key, shift, line_id, material_id = entry["date"], entry["shift"], entry["line_id"], entry["material_id"]
        extrusion_type = "scheduled" if material_id in scheduled_map[date_key][shift] else "unscheduled"
        structured_data[date_key][shift]["extrusion"][line_id][extrusion_type][material_id] = {
            "goal": goal_map.get(material_id, ""),
            "produced": entry["gs"],
            "line_id": line_id
        }
    
    # Process fiber data
    for entry in data_production_spools:
        date_key, shift, material_id = entry["date"], entry["shift"], entry["material_id"]
        fiber_type = "scheduled" if material_id in scheduled_map[date_key][shift] else "unscheduled"
        structured_data[date_key][shift]["fiber"]["FIBR"][fiber_type][material_id] = {
            "goal": goal_map.get(material_id, ""),
            "produced": entry["running_lines"],
        }
    
    # Ensure all scheduled dates in the future are included
    today_str = datetime.today().strftime('%Y-%m-%d')
    for entry in data_production_schedule:
        date_key, shift, line_id, material_id = entry["date"], entry["shift"], entry["line"], entry["material_id"]
        if date_key >= today_str:
            if shift not in structured_data[date_key]:
                structured_data[date_key][shift] = {
                    "compounding": {line_id: {"scheduled": {}, "unscheduled": {}}},
                    "extrusion": {line_id : {"scheduled": {}, "unscheduled": {}}},
                    "fiber": {line_id: {"scheduled": {}, "unscheduled": {}}}
                }


            if line_id in ["EX00", "EX01", "EX02", "EX03", "EX04"]:
                if line_id not in structured_data[date_key][shift]["extrusion"]:
                    structured_data[date_key][shift]["extrusion"][line_id] = {"scheduled": {}, "unscheduled": {}}
                structured_data[date_key][shift]["extrusion"][line_id]["scheduled"].setdefault(material_id, {
                    "goal": goal_map.get(material_id, ""),
                    "produced": 0,
                })
            elif line_id in ["CMP0", "CMP1", "CMP2"]:
                if line_id not in structured_data[date_key][shift]["compounding"]:
                    structured_data[date_key][shift]["compounding"][line_id] = {"scheduled": {}, "unscheduled": {}}
                structured_data[date_key][shift]["compounding"][line_id]["scheduled"].setdefault(material_id, {
                    "goal": goal_map.get(material_id, ""),
                    "produced": 0,
                })

            elif line_id in ["FIBR", "FIB2", "FIB3"]:
                # need additional logic to parse out the  fiber details -->

                
                if line_id not in structured_data[date_key][shift]["fiber"]:
                    structured_data[date_key][shift]["fiber"][line_id] = {"scheduled": {}, "unscheduled": {}}

                if material_id and len(material_id) >  3:
                    material_id = parse_fiber(material_id)
                
                for material in material_id:
                    structured_data[date_key][shift]["fiber"][line_id]["scheduled"].setdefault(material, {
                        "goal": goal_map.get(material, ""),
                        "produced": 0,
                    })
                # print("goofy", material_id)                 
    
    return jsonify({"data": structured_data}), 200




@app.route("/api/view/compounding", methods=["GET"])
def get_view_compounding():
    
    validation_result = validate_date(request.args.get("start_date"), request.args.get("end_date"))

    # Check if the validation result is an error response
    if isinstance(validation_result, tuple) and isinstance(validation_result[0], dict):
        return validation_result  # Return the error response immediately

    start_date, end_date = validation_result  # Unpack only if validation passed

    query = """
        SELECT 
            created_at as date,
            c.material_id,
            SUM(c.mass) AS total_mass,
            s.shift AS shift
        FROM compounding_lots c
        JOIN shift_translation s 
            ON TIME(c.created_at) >= s.start_time 
            AND (TIME(c.created_at) < s.end_time OR (s.shift = 3 AND s.end_time = '00:00:00'))
        WHERE c.created_at >= %s 
            AND c.created_at <= %s
        GROUP BY date, material_id, shift
        ORDER BY date DESC, shift ASC
    """

    params = (start_date, end_date)

    data = fetch(query, params)
    return jsonify({"data" : data}), 200



@app.route("/api/view/graph", methods=["GET"])
def get_view_graph():

    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")

    # Validateoee and parse dates
    if not start_date or not end_date:
        return jsonify({"error": "start_date and end_date are required"}), 400

    try:
        start_date = datetime.strptime(start_date, "%Y-%m-%d")
        end_date = datetime.strptime(end_date, "%Y-%m-%d")
        # print(start_date, end_date)
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

    query = """
        SELECT
            DATE_FORMAT(start_time, %s) AS date,
            material_id,
            count(material_id) as net,
            SUM(CASE WHEN status = 0 OR status = 5 OR status = 6 THEN 1 ELSE 0 END) as `0`,
            SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as `1`,
            SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) as `2`
        FROM 
            extrusion_runs
        WHERE 
            start_time >= %s AND start_time <= %s
            AND line_id IN ('EX00', 'EX01', 'EX03', 'EX04')
        GROUP BY 
            date, 
            material_id
    """

    params = ('%Y-%m-%d', start_date, end_date)

    data  = fetch(query, params)
    return jsonify({"data" : data}), 200


@app.route("/api/metrics/oee", methods=["GET"])
def get_oee_analytics():
    try:
        cnx = msc.connect(**IGNITION_DB_CLUSTER)
        cursor = cnx.cursor()

        query_1 = """
            WITH runtime_data AS (
                SELECT
                    DATE_FORMAT(start_time, '%Y-%m') AS month,
                    line_id,
                    SUM(TIME_TO_SEC(logging_time)) AS total_logging_time_seconds,
            #         SEC_TO_TIME(SUM(TIME_TO_SEC(logging_time))) AS total_logging_time,
                    SUM(TIME_TO_SEC(run_time)) AS total_runtime_seconds
            #         SEC_TO_TIME(SUM(TIME_TO_SEC(run_time))) AS total_runtime
                FROM extrusion_runs
                WHERE start_time >= '2024-01-01'
                AND line_id IN ('EX00', 'EX01', 'EX03', 'EX04')
                GROUP BY month, line_id
            ),
            scheduled_data AS (
                SELECT
                    DATE_FORMAT(date, '%Y-%m') AS month,
                    line AS line_id,
                    COUNT(line) * 8 * 3600 AS scheduled_time_seconds
                FROM production_schedule
                WHERE date >= '2024-01-01'
                AND line IN ('EX00', 'EX01', 'EX03', 'EX04')
                GROUP BY month, line
            ),
            quality_data AS (
                SELECT
                    DATE_FORMAT(start_time, '%Y-%m') AS month,
                    line_id,
                    COUNT(spool_id) AS total_count,
                    SUM(CASE WHEN status = '000' THEN 1 ELSE 0 END) AS status_000_count,
                    ROUND(SUM(CASE WHEN status = '000' THEN 1 ELSE 0 END) / COUNT(spool_id), 3) AS quality_ratio
                FROM extrusion_runs
                WHERE start_time >= '2024-01-01'
                AND line_id IN ('EX00', 'EX01', 'EX03', 'EX04')
                GROUP BY month, line_id
            )
            SELECT
                r.month,
                r.line_id,
                r.total_logging_time_seconds,
                r.total_runtime_seconds,
                s.scheduled_time_seconds,
                ROUND(r.total_logging_time_seconds / s.scheduled_time_seconds, 4) AS availability_ratio,
                q.total_count,
                q.status_000_count,
                q.quality_ratio,
                ROUND(q.quality_ratio * (r.total_logging_time_seconds / s.scheduled_time_seconds), 4) AS oee_ratio
            FROM runtime_data r
            JOIN scheduled_data s
            ON r.month = s.month AND r.line_id = s.line_id
            JOIN quality_data q
            ON r.month = q.month AND r.line_id = q.line_id
            ORDER BY r.month, r.line_id;
        """

        cursor.execute(query_1)

        # zip the results into json
        columns_1 = [desc[0] for desc in cursor.description]  # Get column names
        results_1 = [dict(zip(columns_1, row)) for row in cursor.fetchall()]

        cursor.close()
        cnx.close()

        return jsonify({"data": results_1})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An unknown error occurred", "details": str(e)}), 500

# ////////////////////////////////////////////////////
# System Routes
# ////////////////////////////////////////////////////
@app.route("/api/ping", methods=["GET"])
def api_default():
    import time

    delay = abs(int((random.gauss(0, 1) * 10)))
    time.sleep(delay)

    return jsonify({"pong": f"Hello from the backend! - slept for {delay} seconds"})


def parse_fiber(req):
    """
    Parse the fiber input and return a dictionary with counts.

    The input string should contain fiber codes with their respective counts.
    This function separates the fiber code (letters) and count (numbers) and
    returns a dictionary where keys are fiber codes and values are counts.

    Args:
    req (str): The input string containing fiber information.

    Returns:
    dict: A dictionary with fiber codes as keys and total counts as values.
    """
    fibers_out = {}
    for fiber in req.split():
        count = "".join(filter(str.isdigit, fiber))  # Extract digits
        label = "".join(filter(str.isalpha, fiber))  # Extract letters

        # Convert the count to an integer
        count = int(count) if count else 0  # Handle  case where there might be no number

        # Update counts in the dictionary
        fibers_out[label] = fibers_out.get(label, 0) + count  # Initialize with 0 if key is not present

    return fibers_out


@app.route("/api/load", methods=["GET"])
def get_data():
    """
    Endpoint for pulling in monthly goals.

    Connects to the database and fetches data related to monthly goals.
    This route returns a simple success message for testing purposes.

    Returns:
    json: A response with a success message.
    """
    cnx = msc.connect(**IGNITION_DB_CLUSTER)
    return jsonify({"message": "Successfully connected to database"})


# ////////////////////////////////////////////////////
# Forecast Routes
# ////////////////////////////////////////////////////


@app.route("/api/current", methods=["GET"])
def get_current():
    """
    Endpoint for retrieving the production schedule within a given date range.

    This function retrieves data from the production schedule table for a specified date range.
    It returns the results in JSON format along with the goals and frequency data.

    Query Parameters:
    - start_date (str): The start date in YYYY-MM-DD format.
    - end_date (str): The end date in YYYY-MM-DD format.

    Returns:
    json: A response containing the scheduled data, goals, and frequency.
    """
    try:
        # Extract query parameters
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")

        # Validate and parse dates
        if not start_date or not end_date:
            return jsonify({"error": "start_date and end_date are required"}), 400

        try:
            start_date = datetime.strptime(start_date, "%Y-%m-%d")
            end_date = datetime.strptime(end_date, "%Y-%m-%d")
            # print(start_date, end_date)
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

        # Connect to the database
        cnx = msc.connect(**IGNITION_DB_CLUSTER)
        cursor = cnx.cursor()

        # Query to select data within the date range
        query = """
            SELECT 
                id,
                DATE_FORMAT(date, '%Y-%m-%d') AS date,
                shift,
                line,
                material_id
            FROM production_schedule
            WHERE date >= %s AND date < %s AND line NOT LIKE 'FIBR%' AND line NOT LIKE 'CMP%'
        """

        cursor.execute(
            query, (start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d"))
        )
        # print(cursor.fetchall())

        # Fetch results and process them into a JSON-friendly format
        columns = [desc[0] for desc in cursor.description]  # Get column names
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]

        # Close cursor and connection
        cursor.close()
        cnx.close()

        # Example goals
        goals = {"ONX": 8500, "OXL": 60, "OFR": 340, "172": 990}

        # Build frequency table
        frequency = {}
        for item in results:
            if "material_id" in item:
                frequency[item["material_id"]] = (
                    frequency.get(item["material_id"], 0) + 1
                )

        return jsonify({"scheduled": results, "goals": goals, "frequency": frequency})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An unknown error occurred", "details": str(e)}), 500


@app.route("/api/current/fiber", methods=["GET"])
def get_current_fiber():
    """
    Endpoint for retrieving the production schedule within a given date range.

    This function retrieves data from the production schedule table for a specified date range.
    It returns the results in JSON format along with the goals and frequency data.

    Query Parameters:
    - start_date (str): The start date in YYYY-MM-DD format.
    - end_date (str): The end date in YYYY-MM-DD format.

    Returns:
    json: A response containing the scheduled data, goals, and frequency.
    """
    try:
        start_date = request.args.get("start_date")
        start_time = ""
        if not start_date:
            return jsonify({"error": "start_date and end_date are required"}), 400

        try:
            # Parse the input date
            start_time = datetime.strptime(start_date, "%Y-%m-%d")

            # Convert the date to YY-MM-DD format
            start_date = start_time.strftime("%Y-%m-%d")

        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

        cnx = msc.connect(**IGNITION_DB_CLUSTER)
        cursor = cnx.cursor()

        # Use placeholders in your query
        query = """
        SELECT
            spool_id,
            line_id,
            DATE_FORMAT(start_time, %s) AS start_time,
            TIME_TO_SEC(logging_time) AS logging_time,
            DATE_FORMAT(fixed_time, %s) AS fixed_time
        FROM (
            SELECT
                spool_id,
                line_id,
                start_time,
                logging_time,
                ADDTIME(start_time, logging_time) AS fixed_time
            FROM production_spools
        ) as sub_q
        WHERE 
            DATE(start_time) <= %s AND DATE(fixed_time) >= %s
        """

        cursor.execute(
            query, ("%Y-%m-%d %H:%i:%s", "%Y-%m-%d %H:%i:%s", start_date, start_date)
        )

        raw_results = cursor.fetchall()
        labels = []
        delta = []
        min_time = 0
        max_time = 0
        if len(raw_results):

            label_start_times = [datetime.fromisoformat(row[2]) for row in raw_results]
            label_end_times = [datetime.fromisoformat(row[4]) for row in raw_results]

            # Find the minimum and maximum time across all spools
            min_time = min(label_start_times) if label_start_times else ""
            max_time = max(label_end_times) if label_end_times else ""

            # Generate timeline labels (hourly) covering the entire range
            current_time = min_time.replace(
                minute=0, second=0
            )  # Round down to the nearest hour
            while current_time <= max_time:
                labels.append(current_time.strftime("%m-%d %H"))
                current_time += timedelta(hours=1)

            current_time = min_time.replace(
                minute=0, second=0
            )  # Round down to the nearest hour
            while current_time <= max_time:
                hours_from_target = int(
                    (current_time - start_time).total_seconds() // 3600
                )
                delta.append(f"{hours_from_target:+03}:00")
                current_time += timedelta(hours=1)

        # Output the labels

        # reformat the data
        line_data_dict = {}

        for row in raw_results:
            spool_id, line_id, start_time, logging_time, fixed_time = row
            split_id = spool_id.split("_")
            material_id = ""
            if len(split_id) > 1:
                material_id = split_id[1]
            data_entry = [spool_id, material_id, start_time, logging_time, fixed_time]
            if line_id not in line_data_dict:
                line_data_dict[line_id] = []
            line_data_dict[line_id].append(data_entry)

        # Close cursor and connection
        cursor.close()
        cnx.close()

        # results = json.dumps(results, indent=4, sort_keys=True, default=str)

        # return {"produced": results}
        return jsonify(
            {
                "produced": line_data_dict,
                "range": [min_time, max_time],
                "step": labels,
                "delta": delta,
            }
        )

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An unknown error occurred", "details": str(e)}), 500


@app.route("/api/current/compounding", methods=["GET"])
def get_current_compounding():
    """
    Endpoint for retrieving the production schedule within a given date range.

    This function retrieves data from the production schedule table for a specified date range.
    It returns the results in JSON format along with the goals and frequency data.

    Query Parameters:
    - start_date (str): The start date in YYYY-MM-DD format.
    - end_date (str): The end date in YYYY-MM-DD format.

    Returns:
    json: A response containing the scheduled data, goals, and frequency.
    """

    try:
        # Extract query parameters
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")

        # Validate and parse dates
        if not start_date and end_date:
            return jsonify({"error": "start_date and end_date are required"}), 400

        try:
            start_date = datetime.strptime(start_date, "%Y-%m-%d")
            end_date = datetime.strptime(end_date, "%Y-%m-%d")

        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

        # Connect to the database
        cnx = msc.connect(**IGNITION_DB_CLUSTER)
        cursor = cnx.cursor()

        # Query to select data within the date range
        query_1 = """
            SELECT 
                id,
                DATE_FORMAT(date, %s) AS date,
                shift,
                line,
                material_id
            FROM production_schedule
            WHERE date >= %s AND date < %s AND line LIKE 'CMP%'
        """

        cursor.execute(query_1, ("%Y-%m-%d", start_date, end_date))

        # print(start_date, end_date)

        columns_1 = [desc[0] for desc in cursor.description]  # Get column names
        results_1 = [dict(zip(columns_1, row)) for row in cursor.fetchall()]

        query_2 = """
            SELECT DATE_FORMAT(cl.created_at, %s) as lot_date, cl.material_id, cl.lot_id, cl.mass as lot_mass, cl.raw_powder, cb.batch_id, cb.stage, cb.batch_num, DATE_FORMAT(cb.created_at, %s) as batch_date, cb.mass as batch_mass FROM compounding_lots as cl
            JOIN compounding_batches as cb ON cb.lot_id = cl.lot_id
            WHERE cl.lot_id IN
                (SELECT cb.lot_id
                FROM compounding_batches as cb
                WHERE cb.created_at LIKE %s
                ORDER BY lot_id, batch_id)
        """

        start_date = start_date.strftime("%Y-%m-%d")

        cursor.execute(
            query_2,
            (
                "%Y-%m-%d",
                "%Y-%m-%d",
                f"{start_date}%",
            ),
        )

        # Fetch results and process them into a JSON-friendly format
        columns_2 = [desc[0] for desc in cursor.description]  # Get column names
        results_2 = [dict(zip(columns_2, row)) for row in cursor.fetchall()]

        group_by_lots = {}
        for obj in results_2:
            # print(obj)
            batch_info = [
                obj["batch_date"],
                obj["batch_num"],
                obj["stage"],
                obj["batch_id"],
                obj["batch_mass"],
            ]

            if obj["lot_id"] in group_by_lots:
                # just append the subcontainers

                if obj["batch_date"] == start_date:
                    group_by_lots[obj["lot_id"]]["current"].append(batch_info)
                else:
                    group_by_lots[obj["lot_id"]]["historical"].append(batch_info)
                pass
            else:
                historical = []
                current = []

                if obj["batch_date"] == start_date:
                    current.append(batch_info)
                else:
                    historical.append(batch_info)

                # build the subcontainers
                group_by_lots[obj["lot_id"]] = {
                    "material_id": obj["material_id"],
                    "mass": obj["lot_mass"],
                    "date": obj["lot_date"],
                    "raw_powder": obj["raw_powder"],
                    "historical": historical,
                    "current": current,
                }
                pass

        # Close cursor and connection
        cursor.close()
        cnx.close()

        return jsonify(
            {"scheduled": results_1, "produced": group_by_lots, "extra": results_2}
        )

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An unknown error occurred", "details": str(e)}), 500


# ////////////////////////////////////////////////////
# Schedule Routes
# ////////////////////////////////////////////////////
@app.route("/api/schedule/redo", methods=["POST"])
def overwrite_month():
    """
    Endpoint for overwriting and deleting monthly entries in the database.

    This function handles the overwriting and deletion of existing production schedule entries
    for a specific month. It reads input data from the request and updates the database accordingly.

    Returns:
    json: A response containing the number of rows added or an error message.
    """
    data = request.get_json()

    if not data or "selectedDate" not in data or "input" not in data:
        return (
            jsonify({"error": "Missing required data (selectedDate or schedule)"}),
            400,
        )

    selected_date = data["selectedDate"]
    schedule = data["input"]

    month_schedule = {}
    material_freq = {}

    signature = selected_date
    shifts = ["1", "2"]
    entry_row = []

    translate_line_material = {
        "EX00": None,
        "EX01": None,
        "EX03": None,
        "EX04": None,
        "Compounding": None,
        "Fiber": None,
    }

    translate_material_mat = {
        "COPPER": "CPR",
        "ONYX": "ONX",
        "ONYX XL": "OXL",
        "G16": "G16",
        "ESDV2": "ES2",
        "D2V2 STG2": "D22",
        "D2V2": "D2S",
        "17-4V2STG2": "172",
        "17-4V2": "17F",
        "17-4V2?": "17F",
        "ONYX FR": "OFR",
        "INCONEL": "625",
        "AO1" : "AO1",
        "316L" : "316",
    }

    format_process_key = {
        "EX00": "EX00",
        "EX01": "EX01",
        "EX03": "EX03",
        "EX04": "EX04",
        "Compounding": "CMP0",
        "Fiber": "FIBR",
    }

    for row in schedule:
        if len(row) < 3:
            print(f"Skipping malformed row: {row}")
            continue

        date, week, day, *material_entries = row

        material_entries = [
            entry.replace("*", "").replace("?", "") for entry in material_entries
        ]
        translate_line_material.update(
            dict(zip(translate_line_material.keys(), material_entries))
        )

        if date and day.strip():
            day_key = f"{date}"

            date = str(date).zfill(2)

            for line_id, material in translate_line_material.items():
                # print(line_id)
                ## imporove filtering here
                if not material and line_id != "Fiber":
                    continue

                line_id = (
                    format_process_key[line_id]
                    if line_id in format_process_key
                    else line_id
                )

                for shift in shifts:
                    entry_date = f"{signature}-{date}"
                    entry_id = f"{entry_date}_{shift}_{line_id.upper()}"
                    entry_material = (
                        translate_material_mat.get(material.upper())
                        if line_id != "FIBR"
                        else material
                    )

                    if entry_material:
                        entry_row.append(
                            [
                                entry_id,
                                entry_date,
                                shift,
                                line_id.upper(),
                                entry_material,
                            ]
                        )

    try:

        cnx = msc.connect(**IGNITION_DB_CLUSTER)
        cursor = cnx.cursor(prepared=True)

        query_stmt = """
            INSERT INTO production_schedule (
                id,
                date,
                shift,
                line,
                material_id
            ) VALUES (%s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                date = VALUES(date),
                shift = VALUES(shift),
                line = VALUES(line),
                material_id = VALUES(material_id)
        """

        for row in entry_row:
            cursor.execute(query_stmt, row)

        cnx.commit()

        return jsonify({"added_rows": cursor.rowcount})

    except msc.Error as err:
        print(f"Database error: {err}")
        cnx.rollback()
        return jsonify({"error": str(err)}), 500

    finally:
        if cursor:
            cursor.close()
        if cnx:
            cnx.close()


@app.route("/api/goals/redo", methods=["POST"])
def overwrite_month_goals():
    """
    Endpoint for overwriting and deleting monthly entries in the database.

    This function handles the overwriting and deletion of existing production schedule entries
    for a specific month. It reads input data from the request and updates the database accordingly.

    Returns:
    json: A response containing the number of rows added or an error message.
    """
    data = request.get_json()

    # if not data or 'selectedDate' not in data or 'input' not in data:
    #     return jsonify({"error": "Missing required data (selectedDate or goals)"}), 400

    print(data)

    if not data or "selectedDate" not in data or "goals" not in data:
        return jsonify({"error": "Missing required data (selectedDate or goals)"}), 400

    selected_date = data["selectedDate"]
    goals = data["goals"]

    date_obj = datetime.strptime(selected_date, "%Y-%m")
    formatted_date = date_obj.replace(day=1)
    formatted_date = formatted_date.strftime("%Y-%m-%d")

    try:

        cnx = msc.connect(**IGNITION_DB_CLUSTER)
        cursor = cnx.cursor(prepared=True)

        query_stmt = """
            INSERT INTO production_goals (
                id,
                date,
                material_id,
                goal
            ) VALUES (%s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                goal = VALUES(goal)
        """

        for material_id in goals:
            id = f"{formatted_date}_{material_id}"
            cursor.execute(
                query_stmt, [id, formatted_date, material_id, goals[material_id]]
            )

        cnx.commit()

        return jsonify({"added_rows": cursor.rowcount})

    except msc.Error as err:
        print(f"Database error: {err}")
        cnx.rollback()
        return jsonify({"error": str(err)}), 500

    finally:
        if cursor:
            cursor.close()
        if cnx:
            cnx.close()


def delete_entries_in_month():
    """
    Endpoint to delete entries from the production_schedule table within a specified date range.

    This function deletes entries from the production schedule table based on the provided date range.

    Returns:
    json: A response containing the number of rows deleted or an error message.
    """
    start_date = "2024-10-01"
    end_date = "2024-11-01"

    if not start_date or not end_date:
        return jsonify({"error": "Both start_date and end_date are required."}), 400

    try:
        cnx = msc.connect(**IGNITION_DB_CLUSTER)
        cursor = cnx.cursor()

        delete_query = """
            DELETE FROM production_schedule
            WHERE date BETWEEN %s AND %s
        """

        cursor.execute(delete_query, (start_date, end_date))

        cnx.commit()

        return jsonify({"deleted_rows": cursor.rowcount})

    except msc.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        if cursor:
            cursor.close()
        if cnx:
            cnx.close()


def validate_dates(start_date, end_date):
    try:
        # Parse the strings into datetime objects
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")

        # Check if start_date is before or equal to end_date
        if start > end:
            return "Error: Start date cannot be after end date."
        return True
    except ValueError as e:
        return False


# ////////////////////////////////////////////////////
# Production Routes
# ////////////////////////////////////////////////////


@app.route("/api/extruder", methods=["GET"])
def get_extruder():
    """
    Endpoint for retrieving the daily extrusion data.

    This function retrieves extrusion data for the current month (or a specified date range),
    counts the occurrences of each status (gs, qc, sc), and returns the results in JSON format.

    Returns:
    json: A response containing the extrusion data.
    """
    line_id = request.args.get("line_id")  # Get 'line_id' from query parameters

    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")

    print(start_date, end_date)

    if not line_id:
        return jsonify({"error": "line_id parameter is required"}), 400

    if not start_date or not end_date:
        return (
            jsonify({"error:": "both start_date and end_date parameters are required"}),
            400,
        )

    if not validate_dates(start_date, end_date):
        return jsonify({"error:": "Illegal date format"}), 403

    days_diff = datetime.strptime(end_date, "%Y-%m-%d") - datetime.strptime(
        start_date, "%Y-%m-%d"
    )
    days_diff = days_diff.days

    if not re.match(r"^[A-Za-z]{2}\d{2,4}$", line_id):
        return (
            jsonify({"error": "Invalid line_id format. Must be in the format EX**."}),
            400,
        )

    try:
        cnx = msc.connect(**IGNITION_DB_CLUSTER)
        cursor = cnx.cursor()

        query_1 = """
            SELECT 
                extrusion_runs.line_id,
                spool_id, 
                meters_on_spool,
                meters_scanned,
                volume,
                DATE_FORMAT(logging_time, %s) AS logging_time,
                DATE_FORMAT(run_time, %s) AS run_time,
                failure_mode, 
                line_speed,
                avg_cs_xx,
                avg_cs_xy,
                avg_cs_yy,
                status, 
                DATE_FORMAT(start_time, %s) AS start_time, 
                material_specs.material,
                material_specs.material_id,
                load_id,
                filament_lot_changes.filament_lot,
                filament_lot_changes.feedstock_lot_id
            FROM extrusion_runs
            INNER JOIN material_specs ON material_specs.material_id = extrusion_runs.material_id
            INNER JOIN filament_lot_changes ON filament_lot_changes.filament_lot = extrusion_runs.filament_lot
            WHERE start_time >= %s AND start_time < %s
            AND extrusion_runs.line_id = %s
            ORDER by start_time desc
        """
        cursor.execute(
            query_1,
            (
                "%H:%i:%s",
                "%H:%i:%s",
                "%Y-%m-%d %H:%i:%s",
                start_date,
                end_date,
                line_id,
            ),
        )

        columns_1 = [desc[0] for desc in cursor.description]  # Get column names
        rows = [dict(zip(columns_1, row)) for row in cursor.fetchall()]

        # Separate valid rows and errored rows
        results_1 = [row for row in rows]
        errored_1 = [
            row
            for row in rows
            if any(
                value in [None, ""] for key, value in row.items() if key != "load_id"
            )
        ]

        failure_mode_frequency = {}
        ovens_load = {}
        campaign_statistics = {}

        failure_rate = {
            "good_spool": 0,
            "quality_control": 0,
            "scrap": 0,
        }

        materials_produced = []
        campaign_lots = {"feedstock": set(), "filament": set()}

        errors1 = []
        # get averages

        for row in results_1:
            if "failure_mode" in row and row["failure_mode"]:
                if row["failure_mode"] not in failure_mode_frequency:
                    failure_mode_frequency[row["failure_mode"]] = [row]
                else:
                    failure_mode_frequency[row["failure_mode"]].append(row)
            if "load_id" in row and row["load_id"]:
                if row["load_id"] not in ovens_load:
                    ovens_load[row["load_id"]] = [row]
                else:
                    ovens_load[row["load_id"]].append(row)
            if "feedstock_lot_id" in row and row["feedstock_lot_id"]:
                campaign_lots["feedstock"].add(row["feedstock_lot_id"])

            if "filament_lot" in row and row["filament_lot"]:
                campaign_lots["filament"].add(row["filament_lot"])

            if "material_id" in row and row["material_id"] not in materials_produced:
                materials_produced.append(row["material_id"])

        campaign_lots["feedstock"] = list(campaign_lots["feedstock"])
        campaign_lots["filament"] = list(campaign_lots["filament"])

        # determine ovens availability and oven loads ...
        # implement the date range propery

        query_2 = """
            SELECT DISTINCT o1.oven_name
            FROM ovens o1
            LEFT JOIN (
                SELECT DISTINCT oven_name
                FROM ovens
                WHERE unload_time IS NULL
            ) o2 ON o1.oven_name = o2.oven_name
            WHERE o1.oven_name IS NOT NULL AND o2.oven_name IS NULL"""

        query_3 = """
            SELECT material_id, goal, date
            FROM production_goals
            WHERE DATE_FORMAT(date, '%Y-%m') >= DATE_FORMAT(%s, '%Y-%m')
            AND DATE_FORMAT(date, '%Y-%m') <= DATE_FORMAT(%s, '%Y-%m')
        """

        cursor.execute(query_3, (start_date, end_date))

        columns_3 = [desc[0] for desc in cursor.description]  # Get column names
        results_3 = [dict(zip(columns_3, row)) for row in cursor.fetchall()]

        material_goals = {}
        for row in results_3:
            material_id = row["material_id"]
            goal = row["goal"]

            if material_id in material_goals:
                material_goals[material_id] += goal
            else:
                material_goals[material_id] = goal

        campaign_statistics["ovens"] = {
            "available": [row[0] for row in cursor.fetchall()],
            "full": int(len(results_1) / 66),
            "remainder": len(results_1) % 66,
        }

        cursor.close()
        cnx.close()

        return jsonify(
            {
                "produced": results_1,
                "scheduled": material_goals,
                "projected": 100 * days_diff,
                "active": materials_produced,
                "failures": failure_mode_frequency,
                "statistics": campaign_statistics,
                "ovens": ovens_load,
                "lots": campaign_lots,
                "errored": errored_1,
            }
        )

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An unknown error occurred", "details": str(e)}), 500


@app.route("/api/extruder/live", methods=["GET"])
def get_extruder_live():
    """
    Endpoint for retrieving the live extrusion data.

    This function retrieves extrusion data for the current month (or a specified date range),
    counts the occurrences of each status (gs, qc, sc), and returns the results in JSON format.

    Returns:
    json: A response containing the extrusion data.
    """
    line_id = request.args.get("line_id")  # Get 'line_id' from query parameters

    # line_id = "EX03"

    if not line_id:
        return jsonify({"error": "line_id parameter is required"}), 400

    if not re.match(r"^[A-Za-z]{2}\d{2,4}$", line_id):
        return (
            jsonify({"error": "Invalid line_id format. Must be in the format EX**."}),
            400,
        )

    try:
        cnx = msc.connect(**IGNITION_DB_CLUSTER)
        cursor = cnx.cursor()

        query_1 = """
            SELECT 
                extrusion_runs.line_id,
                spool_id, 
                meters_on_spool,
                meters_scanned,
                volume,
                TIME_TO_SEC(logging_time) AS logging_time,
                DATE_FORMAT(run_time, %s) AS run_time,
                TIME_TO_SEC(run_time) AS run_time_sec,
                failure_mode, 
                line_speed,
                avg_cs_xx,
                avg_cs_xy,
                avg_cs_yy,
                status, 
                DATE_FORMAT(start_time, %s) AS start_time, 
                material_specs.material,
                load_id,
                line_speed,
                filament_lot_changes.filament_lot,
                filament_lot_changes.feedstock_lot_id
            FROM extrusion_runs
            INNER JOIN material_specs ON material_specs.material_id = extrusion_runs.material_id
            INNER JOIN filament_lot_changes ON filament_lot_changes.filament_lot = extrusion_runs.filament_lot
            AND extrusion_runs.line_id = %s
            ORDER by start_time desc
            LIMIT 3
        """

        cursor.execute(query_1, ("%H:%i:%s", "%Y-%m-%d %H:%i:%S", line_id))

        # zip the results into json
        columns_1 = [desc[0] for desc in cursor.description]  # Get column names
        results_1 = [dict(zip(columns_1, row)) for row in cursor.fetchall()]

        for row in results_1:
            if not row["run_time"]:  # Check if run_time is not set
                start_time = datetime.strptime(
                    row["start_time"], "%Y-%m-%d %H:%M:%S"
                )  # Convert start_time to datetime
                current_time = datetime.now()  # Get the current time
                run_time = current_time - start_time  # Calculate the difference

                # Get hours, minutes, and seconds from timedelta
                hours, remainder = divmod(
                    run_time.seconds, 3600
                )  # Divmod to get hours and the remainder
                minutes, seconds = divmod(
                    remainder, 60
                )  # Get minutes and seconds from remainder

                # Add the hours from the timedelta days (if any)
                hours += (
                    run_time.days * 24
                )  # Add the days (in hours) to hours if timedelta spans multiple days

                # Format run_time as HH:MM:SS
                row["run_time"] = (
                    f"{hours:02}:{minutes:02}:{seconds:02}"  # Format as 'HH:MM:SS'
                )
                row["run_time_sec"] = (
                    run_time.total_seconds()
                )  # Optionally, store the time in seconds
                row["meters_on_spool"] = (
                    round(run_time.total_seconds() * 2, 3)
                    if run_time.total_seconds()
                    else 0
                )

        return jsonify({"live": results_1})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An unknown error occurred", "details": str(e)}), 500


@app.route("/api/schedule/existing", methods=["GET"])
def get_schedule_existing():
    try:
        cnx = msc.connect(**IGNITION_DB_CLUSTER)
        cursor = cnx.cursor()

        query_1 = """
            SELECT DISTINCT EXTRACT(YEAR FROM date) AS year, EXTRACT(MONTH FROM date) AS month
            FROM production_schedule
            ORDER BY year DESC, month DESC;
        """

        cursor.execute(query_1)

        # zip the results into json
        columns_1 = [desc[0] for desc in cursor.description]  # Get column names
        results_1 = [dict(zip(columns_1, row)) for row in cursor.fetchall()]

        cursor.close()
        cnx.close()

        return jsonify({"data": results_1})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An unknown error occurred", "details": str(e)}), 500

@app.route("/api/schedule/existing/month", methods=["GET"])
def get_schedule_existing_month():
    """
    Join this information on the production goals by material
    """

    ## should default to the current month - >
    existing_month = "2025-01"
    existing_month = request.args.get("start_date")

    try:
        cnx = msc.connect(**IGNITION_DB_CLUSTER)
        cursor = cnx.cursor()

        query_1 = f"SELECT date, shift, line, material_id FROM production_schedule WHERE date LIKE '{existing_month}%' ORDER BY date, shift, line, material_id"

        cursor.execute(query_1)

        columns_1 = [desc[0] for desc in cursor.description]
        results_1 = [dict(zip(columns_1, row)) for row in cursor.fetchall()]

        query_2 = f"SELECT material_id, goal, date FROM production_goals WHERE date LIKE '{existing_month}%' ORDER BY date, material_id, goal"

        cursor.execute(query_2)

        columns_2 = [desc[0] for desc in cursor.description]
        results_2 = [dict(zip(columns_2, row)) for row in cursor.fetchall()]

        cursor.close()
        cnx.close()

        return jsonify({"data": results_1, "schedule": results_1, "goals": results_2})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An unknown error occurred", "details": str(e)}), 500

@app.route("/api/schedule/existing/lots", methods=["GET"])
def get_schedule_existing_lots():
    """
    Join this information on the production goals by material
    """
    try:
        cnx = msc.connect(**IGNITION_DB_CLUSTER)
        cursor = cnx.cursor()

        query_1 = f"SELECT * FROM incoming_lots WHERE status = 'RELEASED'"

        cursor.execute(query_1)

        columns_1 = [desc[0] for desc in cursor.description]
        results_1 = [dict(zip(columns_1, row)) for row in cursor.fetchall()]

        cursor.close()
        cnx.close()

        return jsonify({"data": results_1})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An unknown error occurred", "details": str(e)}), 500

# ////////////////////////////////////////////////////
# Device/Hardware Routes
# ////////////////////////////////////////////////////


@app.route("/api/hardware/", methods=["GET"])
def get_hardware():
    """returns sheet of all hardware available in billerica -- could filter by whats needed for daily production goals"""
    pass


@app.route("/api/hardware/beaglebone/", methods=["GET"])
def get_beaglebone():
    "responsible for pulling state & process details off beaglebones"
    pass


@app.route("/api/hardware/rumba/", methods=["GET"])
def get_rumba():
    "responsible for pulling status of rumba"
    pass


@app.route("/api/hardware/zumbach/", methods=["GET"])
def get_zumbach():
    """responsible for testing laser stream for each line"""
    pass


@app.route("/api/machine/extruder/", methods=["GET"])
def get_extruder_params():
    """responsible for pulling extruder details --> heater temps bath temps"""
    pass


@app.route("/api/machine/fiber/", methods=["GET"])
def get_rwejf0ewf():
    """responsible for pulling fiber details --> heater temps bath temps"""
    pass


@app.route("/api/machine/respool/", methods=["GET"])
def get_f87wef98():
    """responsible for pulling respool details --> respool station"""
    pass


@app.route("/api/aux/printer/", methods=["GET"])
def get_printer():
    """pings all printers"""
    pass


# ////////////////////////////////////////////////////
# Network Routes
# ////////////////////////////////////////////////////


@app.route("/api/network/ignition/", methods=["GET"])
def get_network():
    """responsible for getting latency and read writes to database as well as tracking db state"""
    pass


# ////////////////////////////////////////////////////
# Alert/status Routes
# ////////////////////////////////////////////////////


@app.route("/api/alert/active", methods=["GET"])
def get_alert_active():
    """responsible for high priority current process failure alerts slack/email/text"""
    pass


@app.route("/api/alert", methods=["GET"])
def get_alert():
    """responsible for general failure alerts, even with machines that are idle"""
    pass


# ////////////////////////////////////////////////////
# Math routes
# ////////////////////////////////////////////////////


@app.route("/api/conversion/extruder", methods=["GET"])
def get_runtime():
    """given a line_id and date this returns, the runtime, the spools produced, the defects, the defects rate"""

    # from shift translation table
    translate_shift = {
        "1": {
            "start_time": "07:00:00.000000",
            "end_time": "15:00:00.000000",
            "duration": 8,
            "date_offset": 0,
        },
        "2": {
            "start_time": "15:00:00.000000",
            "end_time": "23:00:00.000000",
            "duration": 8,
            "date_offset": 0,
        },
        "3": {
            "start_time": "23:00:00.000000",
            "end_time": "07:00:00.000000",
            "duration": 8,
            "date_offset": 1,
        },
    }

    start_date = request.args.get("start_date")  # 2025-01-08
    end_date = request.args.get("end_date")  # 2025-01-09
    
    if not start_date or not end_date:
        return (
            jsonify({"error:": "both start_date and end_date parameters are required"}),
            400,
    )
    
    line_id = request.args.get("line_id")  # EX00 - 04

    shift = request.args.get("shift").split(",")  # [0-3]
    material_id = request.args.get("material_id")  # ONX - not used currently


    min_shift_time = translate_shift[min(shift) if shift else [1, 2, 3]]
    max_shift_time = translate_shift[max(shift) if shift else [1, 2, 3]]

    shifted_start_date = f"{start_date} {min_shift_time['start_time']}"
    shifted_end_date = f"{end_date} {max_shift_time['end_time']}"

    # Loop through each day in the range
    working_days = []

    current_date = datetime.strptime(start_date, "%Y-%m-%d")
    while current_date <= datetime.strptime(end_date, "%Y-%m-%d"):
        # Check if the day is not a weekend (Monday=0, Sunday=6)
        if current_date.weekday() < 5:
            working_days.append(current_date)
        current_date += timedelta(days=1)

    print(shifted_start_date, shifted_end_date)

    # shifted_start_date = datetime.strptime(start_date, "%Y-%m-%d %H:%M:%S.%f")
    # shifted_end_date = datetime.strptime(start_date, "%Y-%m-%d %H:%M:%S.%f")

    try:
        cnx = msc.connect(**IGNITION_DB_CLUSTER)
        cursor = cnx.cursor()

        # goal of this query was to figure out of the days that were running -> how many hours was machine on, how many spools were being produced
        # i could take the raw total time available and do it that way and not sure the details

        # dont know details about shifts not captured in range - > or I could just do it shiftly

        query_1 = """
            SELECT 
                spool_id, 
                meters_on_spool,
                meters_scanned,
                volume,
                DATE_FORMAT(logging_time, %s) AS logging_time,
                DATE_FORMAT(run_time, %s) AS run_time,
                failure_mode, 
                status, 
                DATE_FORMAT(start_time, %s) AS start_time, 
                material_id,
                load_id,
                line_id
            FROM extrusion_runs
            WHERE start_time >= %s AND start_time < %s
            ORDER by start_time
        """

        cursor.execute(
            query_1,
            (
                "%H:%i:%s",
                "%H:%i:%s",
                "%Y-%m-%d %H:%i:%s",
                shifted_start_date,
                shifted_end_date,
            ),
        )

        columns_1 = [desc[0] for desc in cursor.description]  # Get column names
        rows = [dict(zip(columns_1, row)) for row in cursor.fetchall()]

        # process_data
        # for item in rows:
        #     print(item)

        available_runtime = len(shift) * 8 * 3600 * 4
        utilized_runtime = ""

        # Initialize an empty dictionary to store sums for each material_id
        aggregated_data = defaultdict(
            lambda: {
                "loaded": 0,
                "logging_time": 0,
                "net_meters_on_spool": Decimal("0"),
                "net_meters_scanned": Decimal("0"),
                "net_volume": Decimal("0"),
                "run_time": Decimal("0"),
                "spool_count": 0,
                "line_id": set(),
                "percent": 0,
            }
        )
        material_id_frequency = {}        

        # Iterate through each entry in source_datA
        # BUILD MATERIAL dicts based on material status
        for entry in rows:
            material_id = entry["material_id"]
            if entry["material_id"] in material_id_frequency:
                if entry["status"] == 0:
                    material_id_frequency[entry["material_id"]]["gs"] += 1
                elif entry["status"] == 1:
                    material_id_frequency[entry["material_id"]]["wip"] += 1
                elif entry["status"] == 2:
                    material_id_frequency[entry["material_id"]]["sc"] += 1
                else:
                    pass
            else: 
                material_id_frequency[entry["material_id"]] = {
                    "gs": 1 if entry["status"] == 0 else 0,
                    "wip": 1 if entry["status"] == 1 else 0,
                    "sc": 1 if entry["status"] == 2 else 0,
                }

            # Add meters, volume, and time for each material_id
            if entry["meters_on_spool"] is not None:
                aggregated_data[material_id]["net_meters_on_spool"] += entry[
                    "meters_on_spool"
                ]

            if entry["meters_scanned"] is not None:
                aggregated_data[material_id]["net_meters_scanned"] += entry[
                    "meters_scanned"
                ]

            if entry["volume"] is not None:
                aggregated_data[material_id]["net_volume"] += entry["volume"]

            # Convert logging_time and run_time to seconds to sum them
            def time_to_seconds(time_str):
                if time_str is None:
                    return 0
                parts = time_str.split(":")
                return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])

            aggregated_data[material_id]["logging_time"] += time_to_seconds(
                entry["logging_time"]
            )
            aggregated_data[material_id]["run_time"] += time_to_seconds(
                entry["run_time"]
            )

            # Increment spool count
            aggregated_data[material_id]["spool_count"] += 1
            aggregated_data[material_id]["loaded"] += 1 if entry["load_id"] else 0
            aggregated_data[material_id]["line_id"].add(entry["line_id"])

        # Final result with aggregated data
        final_result = {}
        for material_id, data in aggregated_data.items():
            final_result[material_id] = {
                "loaded": data["loaded"],
                "logging_time": data["logging_time"],
                "net_meters_on_spool": str(data["net_meters_on_spool"]),
                "net_meters_scanned": str(data["net_meters_scanned"]),
                "net_volume": str(data["net_volume"]),
                "run_time": data["run_time"],
                "spool_count": data["spool_count"],
                "line_id": list(data["line_id"]),
                "percent": f"{(data['logging_time'] * 100.00) / (available_runtime * len(working_days)):.2f}",
                "count" : material_id_frequency[material_id]
            }

        # Example of the final output
        # print(final_result)

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An unknown error occurred", "details": str(e)}), 500

    return jsonify(
        {"raw": rows, "produced": final_result, "duration": available_runtime, "working" : working_days}
    )

def parse_run_time(run_time):
    """
    Parse the `run_time` field, which can either be a float (in minutes)
    or a time string in the format "HH:MM:SS".
    """
    try:
        # Try to parse as a float (minutes)
        return timedelta(minutes=float(run_time))
    except ValueError:
        # If parsing as float fails, assume it's in "HH:MM:SS" format
        try:
            h, m, s = map(int, run_time.split(":"))
            return timedelta(hours=h, minutes=m, seconds=s)
        except Exception as e:
            raise ValueError(f"Invalid run_time format: {run_time}") from e
        
@app.route("/api/metrics/graph", methods={"GET"})
def get_monthly_analytics_graph():
    """to pull in all time series graphs about extrusion...
        to pull in runtime time series to show seconds running vs not running per extruder and material.
        need labeling for the days of the week that are elapsed
    """

#         SELECT
#     DATE_FORMAT(start_time, '%Y-%m-%d') AS day,
#     material_id,
#     count(material_id),
#     SUM(CASE WHEN status = 0  THEN 1 ELSE 0 END) as `0`,
#     SUM(CASE WHEN status = 1  THEN 1 ELSE 0 END) as `1`,
#     SUM(CASE WHEN status = 2  THEN 1 ELSE 0 END) as `2`,
#     SUM(CASE WHEN status = 5  THEN 1 ELSE 0 END) as `5`,
#     SUM(CASE WHEN status = 6  THEN 1 ELSE 0 END) as `6`
# FROM extrusion_runs
# WHERE start_time >= '2025-01-01' AND start_time < '2025-01-31'
#   AND line_id IN ('EX00', 'EX01', 'EX03', 'EX04')
# GROUP BY day, material_id
# ORDER BY day, material_id;
    

    pass
def calculate_spools_created(entry, net_spools_created):
    """
    Calculate and update the spool count based on the material_id and status.
    """
    material_id = entry['material_id']
    status = int(entry['status']) if entry['status'] is not None else 2

    # Initialize the material if it's not already in the dictionary
    if material_id not in net_spools_created:
        net_spools_created[material_id] = {
            0: 0,
            1: 0,
            2: 0,
            5: 0,
            6: 0
        }

    # Increment the spool count based on the status
    net_spools_created[material_id][status] += 1

@app.route("/api/view/counts", methods=["GET"])
def get_view_count_analytics():
    """To pull in all lots, efficiency metrics for view"""
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    
    if not start_date or not end_date:
        return (
            jsonify({"error:": "both start_date and end_date parameters are required"}),
            400,
        )
    
    try:
        query_spool_counts = """
            WITH shift_intervals AS (
                SELECT
                    idx,
                    shift,
                    start_time,
                    end_time,
                    date_offset
                FROM shift_translation
            ),
            all_spools AS (
                SELECT
                    extrusion_runs.status,
                    extrusion_runs.material_id,
                    extrusion_runs.line_id,
                    extrusion_runs.meters_scanned,
                    extrusion_runs.meters_on_spool,
                    extrusion_runs.failure_mode,
                    extrusion_runs.start_time,
                    DATE(extrusion_runs.start_time) AS production_date,
                    TIME(extrusion_runs.start_time) AS production_time,
                    extrusion_runs.avg_cs_xy
                FROM extrusion_runs
                LEFT JOIN material_specs
                    ON extrusion_runs.material_id = material_specs.material_id
                WHERE
                    DATE(extrusion_runs.start_time) >= %s
                    AND DATE(extrusion_runs.start_time) < %s
                    AND extrusion_runs.meters_scanned < (material_specs.spool_length_min + 150)
                    AND extrusion_runs.line_id != 'EX02'
            ),
            spool_shifted AS (
                SELECT
                    a.*,
                    s.shift,
                    DATE_ADD(a.production_date, INTERVAL s.date_offset DAY) AS shift_date
                FROM all_spools a
                JOIN shift_intervals s
                    ON a.production_time >= s.start_time AND 
                    (s.end_time > s.start_time AND a.production_time < s.end_time
                        OR s.end_time < s.start_time AND (a.production_time < s.end_time OR a.production_time >= s.start_time))
            ),
            spool_volume AS (
                SELECT
                    spool_shifted.material_id,
                    spool_shifted.shift_date,
                    spool_shifted.shift,
                    ROUND(AVG(spool_shifted.avg_cs_xy * spool_shifted.meters_on_spool) / 100, 2) AS spool_volume_avg
                FROM spool_shifted
                WHERE spool_shifted.material_id IN ('820', 'G16')
                GROUP BY spool_shifted.material_id, spool_shifted.shift_date, spool_shifted.shift
            ),
            total_spools AS (
                SELECT
                    spool_shifted.material_id,
                    spool_shifted.line_id,
                    spool_shifted.shift_date,
                    spool_shifted.shift,
                    COUNT(*) AS total_spools,
                    ROUND(
                        COUNT(*) * material_specs.density * spool_volume.spool_volume_avg / 10,
                    2) AS total_kg
                FROM spool_shifted
                LEFT JOIN material_specs
                    ON spool_shifted.material_id = material_specs.material_id
                LEFT JOIN spool_volume
                    ON spool_shifted.material_id = spool_volume.material_id
                    AND spool_shifted.shift_date = spool_volume.shift_date
                    AND spool_shifted.shift = spool_volume.shift
                GROUP BY spool_shifted.material_id, spool_shifted.line_id, spool_shifted.shift_date, spool_shifted.shift, spool_volume.spool_volume_avg, material_specs.density
            ),
            wip_spools AS (
                SELECT
                    spool_shifted.material_id,
                    spool_shifted.line_id,
                    spool_shifted.shift_date,
                    spool_shifted.shift,
                    COUNT(*) AS wip_spools,
                    ROUND(SUM(spool_shifted.meters_scanned) / material_specs.spool_length_min) AS wip_spools_adj,
                    material_specs.spool_length_min
                FROM spool_shifted
                LEFT JOIN material_specs
                    ON spool_shifted.material_id = material_specs.material_id
                WHERE
                    spool_shifted.status = '000'
                GROUP BY spool_shifted.material_id, spool_shifted.line_id, spool_shifted.shift_date, spool_shifted.shift, material_specs.spool_length_min
            ),
            qc_spools AS (
                SELECT
                    spool_shifted.material_id,
                    spool_shifted.line_id,
                    spool_shifted.shift_date,
                    spool_shifted.shift,
                    COUNT(*) AS qc_spools,
                    ROUND(SUM(spool_shifted.meters_scanned) / material_specs.spool_length_min) AS qc_spools_adj
                FROM spool_shifted
                LEFT JOIN material_specs
                    ON spool_shifted.material_id = material_specs.material_id
                WHERE
                    spool_shifted.status = '001'
                GROUP BY spool_shifted.material_id, spool_shifted.line_id, spool_shifted.shift_date, spool_shifted.shift, material_specs.spool_length_min
            ),
            scrap_spools AS (
                SELECT
                    spool_shifted.material_id,
                    spool_shifted.line_id,
                    spool_shifted.shift_date,
                    spool_shifted.shift,
                    COUNT(*) AS scrap_spools,
                    ROUND(SUM(spool_shifted.meters_scanned) / material_specs.spool_length_min) AS scrap_spools_adj
                FROM spool_shifted
                LEFT JOIN material_specs
                    ON spool_shifted.material_id = material_specs.material_id
                WHERE
                    spool_shifted.status = '002'
                GROUP BY spool_shifted.material_id, spool_shifted.line_id, spool_shifted.shift_date, spool_shifted.shift, material_specs.spool_length_min
            )
            SELECT
                DATE_FORMAT(total_spools.shift_date, %s) as shift_date,
                total_spools.shift,
                total_spools.material_id,
                total_spools.line_id,
                material_specs.spool_length_min AS spool_len_const,
                COALESCE(total_spools.total_spools, 0) AS total_spools,
                total_spools.total_kg,
                COALESCE(wip_spools.wip_spools, 0) AS wip_spools,
                COALESCE(wip_spools.wip_spools_adj, 0) AS wip_spools_adj,
                COALESCE(qc_spools.qc_spools, 0) AS qc_spools,
                COALESCE(qc_spools.qc_spools_adj, 0) AS qc_spools_adj,
                COALESCE(scrap_spools.scrap_spools, 0) AS scrap_spools,
                COALESCE(scrap_spools.scrap_spools_adj, 0) AS scrap_spools_adj
            FROM total_spools
            LEFT JOIN wip_spools
                ON total_spools.material_id = wip_spools.material_id
                AND total_spools.line_id = wip_spools.line_id
                AND total_spools.shift_date = wip_spools.shift_date
                AND total_spools.shift = wip_spools.shift
            LEFT JOIN qc_spools
                ON total_spools.material_id = qc_spools.material_id
                AND total_spools.line_id = qc_spools.line_id
                AND total_spools.shift_date = qc_spools.shift_date
                AND total_spools.shift = qc_spools.shift
            LEFT JOIN scrap_spools
                ON total_spools.material_id = scrap_spools.material_id
                AND total_spools.line_id = scrap_spools.line_id
                AND total_spools.shift_date = scrap_spools.shift_date
                AND total_spools.shift = scrap_spools.shift
            LEFT JOIN material_specs
                ON total_spools.material_id = material_specs.material_id
            ORDER BY total_spools.shift_date DESC, total_spools.shift DESC, total_spools.total_spools DESC;
        """
    

        
        params_spool_counts = (
            start_date, end_date, "%Y-%m-%d %H:%i:%s", 
        )

        results_spool_counts = fetch(query_spool_counts, params_spool_counts)



        # Helper function to calculate the spools created
        net_spools_created = {}

        # Process the rows and calculate spools created
        
        return jsonify({"counts": results_spool_counts})
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An unknown error occurred", "details": str(e)}), 500

    


@app.route("/api/view/details", methods=["GET"])
def get_view_lot_analytics():
    """To pull in all lots, efficiency metrics for view"""
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    
    if not start_date or not end_date:
        return (
            jsonify({"error:": "both start_date and end_date parameters are required"}),
            400,
        )
    
    try:
        # Prepare the query and parameters
        query_lots_mass = """
            SELECT
                flc.feedstock_lot_id,
                er.filament_lot,
                il.mass AS available, 
                COALESCE(SUM(CAST(er.notes AS DECIMAL(10,2))) / 1000, 0.0) AS mass,
                SUM(er.meters_on_spool) AS total_meters,
                ROUND(SUM(CASE WHEN er.status = 0 THEN er.meters_on_spool ELSE 0 END) / NULLIF(SUM(er.meters_on_spool), 0), 6) AS gs,
                ROUND(SUM(CASE WHEN er.status = 1 THEN er.meters_on_spool ELSE 0 END) / NULLIF(SUM(er.meters_on_spool), 0), 6) AS qc,
                ROUND(SUM(CASE WHEN er.status = 2 THEN er.meters_on_spool ELSE 0 END) / NULLIF(SUM(er.meters_on_spool), 0), 6) AS sc
            FROM extrusion_runs AS er
            JOIN filament_lot_changes AS flc ON flc.filament_lot = er.filament_lot
            JOIN incoming_lots AS il ON flc.feedstock_lot_id = il.lot_id  
            WHERE er.start_time >= %s
            AND er.start_time <= %s
            GROUP BY flc.feedstock_lot_id, er.filament_lot, il.mass
            ORDER BY flc.feedstock_lot_id, er.filament_lot;
        """
        
        params_lots_mass = (
            start_date, end_date
        )

        # Use fetch function to get the data
        results_lots_mass = fetch(query_lots_mass, params_lots_mass)

        query_efficiency = """
            SELECT
                material_id,
                TIME_FORMAT(SEC_TO_TIME(COALESCE(MAX(runtime_seconds), 0)), %s) AS max_runtime,
                TIME_FORMAT(SEC_TO_TIME(COALESCE(MIN(runtime_seconds), 0)), %s) AS min_runtime,
                TIME_FORMAT(SEC_TO_TIME(COALESCE(AVG(runtime_seconds), 0)), %s) AS avg_runtime,
                TIME_FORMAT(SEC_TO_TIME(COALESCE(SUM(CASE WHEN status = 0 THEN runtime_seconds ELSE 0 END), 0)), %s) AS time_0,
                TIME_FORMAT(SEC_TO_TIME(COALESCE(SUM(CASE WHEN status = 1 THEN runtime_seconds ELSE 0 END), 0)), %s) AS time_1,
                TIME_FORMAT(SEC_TO_TIME(COALESCE(SUM(CASE WHEN status = 2 THEN runtime_seconds ELSE 0 END), 0)), %s) AS time_2,
                ROUND(
                    COALESCE(SUM(CASE WHEN status = 0 THEN runtime_seconds ELSE 0 END) / NULLIF(SUM(runtime_seconds), 0), 0) * 100, 
                    2
                ) AS `%_0`,
                ROUND(
                    COALESCE(SUM(CASE WHEN status = 1 THEN runtime_seconds ELSE 0 END) / NULLIF(SUM(runtime_seconds), 0), 0) * 100, 
                    2
                ) AS `%_1`,
                ROUND(
                    COALESCE(SUM(CASE WHEN status = 2 THEN runtime_seconds ELSE 0 END) / NULLIF(SUM(runtime_seconds), 0), 0) * 100, 
                    2
                ) AS `%_2`,
                COALESCE(MAX(CASE WHEN status = 0 THEN meters_on_spool ELSE NULL END), 0) AS max_meters_0,
                COALESCE(MIN(CASE WHEN status = 0 THEN meters_on_spool ELSE NULL END), 0) AS min_meters_0,
                COALESCE(AVG(CASE WHEN status = 0 THEN meters_on_spool ELSE NULL END), 0) AS avg_meters_0,
                COALESCE(MAX(CASE WHEN status = 1 THEN meters_on_spool ELSE NULL END), 0) AS max_meters_1,
                COALESCE(MIN(CASE WHEN status = 1 THEN meters_on_spool ELSE NULL END), 0) AS min_meters_1,
                COALESCE(AVG(CASE WHEN status = 1 THEN meters_on_spool ELSE NULL END), 0) AS avg_meters_1,
                COALESCE(MAX(CASE WHEN status = 2 THEN meters_on_spool ELSE NULL END), 0) AS max_meters_2,
                COALESCE(MIN(CASE WHEN status = 2 THEN meters_on_spool ELSE NULL END), 0) AS min_meters_2,
                COALESCE(AVG(CASE WHEN status = 2 THEN meters_on_spool ELSE NULL END), 0) AS avg_meters_2
            FROM (
                SELECT
                    material_id,
                    status,
                    COALESCE(TIME_TO_SEC(logging_time), 0) AS runtime_seconds,
                    COALESCE(meters_on_spool, 0) AS meters_on_spool
                FROM extrusion_runs
                WHERE start_time >= %s
                AND start_time <= %s
            ) AS er
            GROUP BY material_id
        """

        params_efficiency = (
            '%H:%i:%s','%H:%i:%s','%H:%i:%s','%H:%i:%s','%H:%i:%s','%H:%i:%s', start_date, end_date
        )

        results_efficiency = fetch(query_efficiency, params_efficiency)

        # Helper function to calculate the spools created
        net_spools_created = {}

        query_spool_counts = """
            WITH all_spools AS (
                SELECT
                    status,
                    extrusion_runs.material_id,
                    line_id,
                    meters_scanned,
                    meters_on_spool,
                    failure_mode,
                    start_time,
                    avg_cs_xy
                FROM extrusion_runs
                LEFT JOIN material_specs
                    ON extrusion_runs.material_id = material_specs.material_id
                WHERE
                    DATE(start_time) >= %s
                    and DATE(start_time) < %s
                    and meters_scanned < (spool_length_min + 150)
                    and line_id != 'EX02'
            ),
            spool_volume as (
                select
                    all_spools.material_id,
                    round(avg(avg_cs_xy * meters_on_spool) / 100, 2) as spool_volume_avg
                from all_spools
                left join material_specs
                on all_spools.material_id = material_specs.material_id
                where all_spools.material_id in ("820", "G16")
                group by 1
            ),
            total_spools AS (
                SELECT
                    all_spools.material_id,
                    line_id,
                    count(*) AS total_spools,
                    round(
                        count(*)
                        * material_specs.density
                        * spool_volume.spool_volume_avg
                        / 10
                    , 2) as total_kg
                FROM all_spools
                LEFT JOIN material_specs
                ON all_spools.material_id = material_specs.material_id
                LEFT JOIN spool_volume
                ON all_spools.material_id = spool_volume.material_id
                GROUP BY all_spools.material_id, line_id, spool_volume.spool_volume_avg
            ),
            wip_spools AS (
                SELECT
                    all_spools.material_id,
                    line_id,
                    count(*) AS wip_spools,
                    ROUND(SUM(meters_scanned) / material_specs.spool_length_min) AS wip_spools_adj,
                    material_specs.spool_length_min
                FROM all_spools
                LEFT JOIN material_specs
                    ON all_spools.material_id = material_specs.material_id
                WHERE
                    status = "000"
                GROUP BY material_id, line_id
            ),
            qc_spools AS (
                SELECT
                    all_spools.material_id,
                    line_id,
                    count(*) AS qc_spools,
                    ROUND(SUM(meters_scanned) / material_specs.spool_length_min) AS qc_spools_adj
                FROM all_spools
                LEFT JOIN material_specs
                    ON all_spools.material_id = material_specs.material_id
                WHERE
                    status = "001"
                GROUP BY material_id, spool_length_min, line_id
            ),
            scrap_spools AS (
                SELECT
                    all_spools.material_id,
                    line_id,
                    count(*) AS scrap_spools,
                    ROUND(SUM(meters_scanned) / material_specs.spool_length_min) AS scrap_spools_adj
                FROM all_spools
                LEFT JOIN material_specs
                    ON all_spools.material_id = material_specs.material_id
                WHERE
                    status = "002"
                GROUP BY all_spools.material_id, spool_length_min, line_id
            )
            SELECT
                total_spools.material_id,
                total_spools.line_id,
                spool_length_min as spool_len_const,
                COALESCE(total_spools, 0) as total_spools,
                total_kg,
                COALESCE(wip_spools, 0) as wip_spools,
                COALESCE(wip_spools_adj, 0) as wip_spools_adj,
                COALESCE(qc_spools, 0) as qc_spools,
                COALESCE(qc_spools_adj, 0) as qc_spools_adj,
                COALESCE(scrap_spools, 0) as scrap_spools,
                COALESCE(scrap_spools_adj, 0) as scrap_spools_adj
            FROM total_spools
            LEFT JOIN wip_spools
                ON total_spools.material_id = wip_spools.material_id
                AND total_spools.line_id = wip_spools.line_id
            LEFT JOIN qc_spools
                ON total_spools.material_id = qc_spools.material_id
                AND total_spools.line_id = qc_spools.line_id
            LEFT JOIN scrap_spools
                ON total_spools.material_id = scrap_spools.material_id
                AND total_spools.line_id = scrap_spools.line_id
            ORDER BY total_spools DESC
        """

        
        params_spool_counts = (
            start_date, end_date
        )

        results_spool_counts = fetch(query_spool_counts, params_spool_counts)



        # Helper function to calculate the spools created
        net_spools_created = {}

        # Process the rows and calculate spools created
        
        return jsonify({"lot_mass" : results_lots_mass, "efficiency" : results_efficiency, "counts": results_spool_counts})
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An unknown error occurred", "details": str(e)}), 500




@app.route("/api/view/metrics", methods=["GET"])
def get_view_metrics_analytics():
    """To pull in all time series graphs about extrusion."""
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    
    if not start_date or not end_date:
        return (
            jsonify({"error:": "both start_date and end_date parameters are required"}),
            400,
        )
    
    try:
        # Prepare the query and parameters
        query_production_spools = """
            SELECT spool_id, DATE_FORMAT(logging_time, %s) AS logging_time,
                   DATE_FORMAT(run_time, %s) AS run_time, failure_mode, status, 
                   DATE_FORMAT(start_time, %s) AS start_time, meters_on_spool,
                   meters_scanned, material_id, line_id
            FROM extrusion_runs
            WHERE start_time >= %s AND start_time <= %s
            ORDER BY start_time
        """
        
        params_production_spools = (
            "%H:%i:%s", "%H:%i:%s", "%Y-%m-%d %H:%i:%s", start_date, end_date
        )

        # Use fetch function to get the data
        rows = fetch(query_production_spools, params_production_spools)

        # Shift times as provided
        translate_shift = {
            "1": {"start_time": "07:00:00.000000", "end_time": "15:00:00.000000", "duration": 8, "date_offset": 0},
            "2": {"start_time": "15:00:00.000000", "end_time": "23:00:00.000000", "duration": 8, "date_offset": 0},
            "3": {"start_time": "23:00:00.000000", "end_time": "07:00:00.000000", "duration": 8, "date_offset": 1},
        }

        # Helper function to calculate the spools created
        net_spools_created = {}

        # Process the rows and calculate spools created
        for entry in rows:
            calculate_spools_created(entry, net_spools_created)

        return jsonify(
            {"spools_created": net_spools_created}
        )
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An unknown error occurred", "details": str(e)}), 500

@app.route("/api/metrics/extruder", methods=["GET"])
def get_runtime_analytics():
    """to pull in all time series graphs about extrusion...
        to pull in runtime time series to show seconds running vs not running per extruder and material.
        need labeling for the days of the week that are elapsed
    """
    start_date = request.args.get("start_date")  # 2025-01-08
    end_date = request.args.get("end_date")  # 2025-01-09
    
    if not start_date or not end_date:
        return (
            jsonify({"error:": "both start_date and end_date parameters are required"}),
            400,
    )
    
    try:
        cnx = msc.connect(**IGNITION_DB_CLUSTER)
        cursor = cnx.cursor()

        query_1 = """
            SELECT 
                spool_id, 
                DATE_FORMAT(logging_time, %s) AS logging_time,
                DATE_FORMAT(run_time, %s) AS run_time,
                failure_mode, 
                status, 
                DATE_FORMAT(start_time, %s) AS start_time, 
                meters_on_spool,
                meters_scanned,
                material_id,
                line_id
            FROM extrusion_runs
            WHERE start_time >= %s AND start_time < %s
            ORDER by start_time
        """

        cursor.execute(
            query_1,
            (
                "%H:%i:%s",
                "%H:%i:%s",
                "%Y-%m-%d %H:%i:%s",
                start_date,
                end_date,
            ),
        )

        columns_1 = [desc[0] for desc in cursor.description]  # Get column names
        rows = [dict(zip(columns_1, row)) for row in cursor.fetchall()]

        # print("query 1", rows)
        
        # Shift times as provided
        translate_shift = {
            "1": {
                "start_time": "07:00:00.000000",
                "end_time": "15:00:00.000000",
                "duration": 8,
                "date_offset": 0,
            },
            "2": {
                "start_time": "15:00:00.000000",
                "end_time": "23:00:00.000000",
                "duration": 8,
                "date_offset": 0,
            },
            "3": {
                "start_time": "23:00:00.000000",
                "end_time": "07:00:00.000000",
                "duration": 8,
                "date_offset": 1,
            },
        }

        # Function to get the date range (from start_date to end_date)
        def get_date_range(start_date, end_date):
            current_date = start_date
            while current_date <= end_date:
                yield current_date
                current_date += timedelta(days=1)

        # Define the start and end date from the user input or request args
        start_date = datetime.strptime(start_date, '%Y-%m-%d')
        end_date = datetime.strptime(end_date, '%Y-%m-%d')

        # Initialize the object to store spool production count by day and shift
        material_by_date_shift = defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: defaultdict(int))))

        status_obj = {}

        net_meters_on_spool = {
        }

        net_meters_scanned = {       
        }

        net_spools_created = {

        }

        # Process the data
        for entry in rows:
            start_time = datetime.strptime(entry['start_time'], '%Y-%m-%d %H:%M:%S')  # Convert string to datetime
            date_key = start_time.strftime('%Y-%m-%d')  # Get the date as YYYY-MM-DD
            material_id = entry['material_id']
            status = int(entry['status']) if entry['status'] != None else 2
            
            meters_on_spool = entry['meters_on_spool']
            meters_scanned = entry['meters_scanned']

            # net_meters_on_spool[status] += entry['meters_on_spool']
            # net_meters_scanned[status] += entry['meters_scanned']

            if material_id in net_meters_on_spool:
                net_meters_on_spool[material_id][status] += entry['meters_on_spool']
            else:
                net_meters_on_spool[material_id] = {
                    0 : 0,
                    1 : 0,
                    2 : 0, 
                    5 : 0,
                    6 : 0
                }
                net_meters_on_spool[material_id][status] = entry['meters_on_spool'] if entry['meters_on_spool'] is not None else 0
            

            if material_id in net_meters_scanned:
                net_meters_scanned[material_id][status] += entry['meters_on_spool'] if entry['meters_on_spool'] is not None else 0
            else:
                net_meters_scanned[material_id] = {
                    0 : 0,
                    1 : 0,
                    2 : 0, 
                    5 : 0,
                    6 : 0
                }
                net_meters_scanned[material_id][status] = entry['meters_on_spool']  if entry['meters_on_spool'] is not None else 0

            if material_id in net_spools_created:
                net_spools_created[material_id][status] += 1
            else:
                net_spools_created[material_id] = {
                    0 : 0,
                    1 : 0,
                    2 : 0,
                    5 : 0,
                    6 : 0
                }
                net_spools_created[material_id][status] = 1

            # If the date falls within the requested range, process
            if start_date <= start_time <= end_date:
                    
                # Determine which shift the entry falls into
                for shift, shift_info in translate_shift.items():
                    shift_start_time = datetime.strptime(shift_info["start_time"], "%H:%M:%S.%f").time()
                    shift_end_time = datetime.strptime(shift_info["end_time"], "%H:%M:%S.%f").time()
                    
                    # For shift 3, we need to account for the date offset because it spans midnight
                    if shift == "3":
                        if start_time.time() >= shift_start_time or start_time.time() < shift_end_time:
                            shift_key = shift
                            shift_date = (start_time + timedelta(days=shift_info["date_offset"])).strftime('%Y-%m-%d')
                            material_by_date_shift[material_id][shift_date][shift_key][status] += 1  # Increment spool count
                    else:
                        if shift_start_time <= start_time.time() < shift_end_time:
                            shift_key = shift
                            material_by_date_shift[material_id][date_key][shift_key][status] += 1  # Increment spool count

        # Store the results in a dictionary format
        final_result = {}

        # Build the final result dictionary
        for material, dates in material_by_date_shift.items():
            final_result[material] = {}
            for date in get_date_range(start_date, end_date):
                date_str = date.strftime('%Y-%m-%d')
                final_result[material][date_str] = {}
                
                # For each shift, add the spool count
                for shift in translate_shift:
                    final_result[material][date_str][shift] = {}
                    if shift in dates[date_str]:
                        for status, spool_count in dates[date_str][shift].items():
                            final_result[material][date_str][shift][status] = spool_count
                    else:
                        # If no data for this shift, set all statuses to 0 spools
                        final_result[material][date_str][shift] = {
                            0: 0,
                            1: 0,
                            2: 0,
                            5 : 0,
                            6 : 0
                        }

        # Example output: the result is now stored in final_result dictionary


        timeseries = {}
        absolute_start_times = {}  # To store the earliest start time for each line_id
        max_relative_end_time = 0

        timeseries["EX00"] = []
        timeseries["EX01"] = []
        timeseries["EX03"] = []
        timeseries["EX04"] = []

        failure_modes = {}
        failure_modes["EX00"] = {}
        failure_modes["EX01"] = {}
        failure_modes["EX03"] = {}
        failure_modes["EX04"] = {}

        for record in rows:
            line_id = record["line_id"]
            start_time = datetime.strptime(record["start_time"], "%Y-%m-%d %H:%M:%S")

            # Initialize the line_id in the dictionary if not already present
            if line_id not in timeseries:
                timeseries[line_id] = []

            # Track the absolute start time for each line_id
            if line_id not in absolute_start_times or start_time < absolute_start_times[line_id]:
                absolute_start_times[line_id] = start_time

        
        material_id_freq = {}
            
        # Process each record
        for record in rows:
            line_id = record["line_id"]
            start_time = datetime.strptime(record["start_time"], "%Y-%m-%d %H:%M:%S")
            run_duration = parse_run_time(record["run_time"] if record["run_time"] else 0)  # Parse run_time into timedelta
            material_id = record["material_id"]
            status = record["status"]
            failure_mode = record["failure_mode"]
            spool_id = record["spool_id"]

            # Determine the end time of the run
            end_time = start_time + run_duration

            # Calculate the relative start and end times
            # absolute_start_time = absolute_start_times[line_id]
            absolute_start_time = min(absolute_start_times.values())
            relative_start = (start_time - absolute_start_time).total_seconds()
            relative_end = (end_time - absolute_start_time).total_seconds()
            max_relative_end_time = max(max_relative_end_time, relative_end)


            # Initialize the line_id in the dictionary if not already present
            if line_id not in timeseries:
                timeseries[line_id] = []

            # Append the running interval
            timeseries[line_id].append({"start": start_time, "end": end_time, "state": "running", "material_id" : material_id, "status": status, "failure_mode" : failure_mode, "relative_start": relative_start, "relative_end": relative_end, "spool_id" : spool_id})

        # Fill in "not running" gaps
        for line_id, intervals in timeseries.items():
            intervals.sort(key=lambda x: x["start"])  # Sort intervals by start time
            enriched_intervals = []

            for i in range(len(intervals)):
                # Add the current interval
                enriched_intervals.append(intervals[i])

                # Check for gaps between current and next interval
                if i < len(intervals) - 1:
                    current_end = intervals[i]["end"]
                    next_start = intervals[i + 1]["start"]

                    # If there is a gap, add a "not running" interval
                    if next_start > current_end:
                        # absolute_start_time = absolute_start_times[line_id]
                        absolute_start_time = min(absolute_start_times.values())
                        relative_start = (current_end - absolute_start_time).total_seconds()
                        relative_end = (next_start - absolute_start_time).total_seconds()
                        max_relative_end_time = max(max_relative_end_time, relative_end)
                        enriched_intervals.append({"start": current_end, "end": next_start, "state": "not running", "relative_start": relative_start, "relative_end": relative_end})

            timeseries[line_id] = enriched_intervals
                # for line_id, intervals in timeseries.items():
                #     print(f"Line ID: {line_id}")
                #     for interval in intervals:
                #         print(f"  {interval['start']} - {interval['end']} : {interval['state']}")

            
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An unknown error occurred", "details": str(e)}), 500

    return jsonify(
        {"raw": timeseries, "max_relative_end_time" : max_relative_end_time, "timeline": final_result, "meters_scanned": net_meters_scanned, "meters_on_spool": net_meters_on_spool, "spools_created" : net_spools_created}
    )   


@app.route("/api/goals/extruder", methods=["GET"])
def get_runtime_goals():
    """this pull in the production goals for the date range"""

    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")


    try:
        cnx = msc.connect(**IGNITION_DB_CLUSTER)
        cursor = cnx.cursor()    
        query_3 = """
            SELECT material_id, goal, date
            FROM production_goals
            WHERE DATE_FORMAT(date, '%Y-%m') >= DATE_FORMAT(%s, '%Y-%m')
            AND DATE_FORMAT(date, '%Y-%m') <= DATE_FORMAT(%s, '%Y-%m')
        """

        cursor.execute(query_3, (start_date, end_date))

        columns_3 = [desc[0] for desc in cursor.description]  # Get column names
        results_3 = [dict(zip(columns_3, row)) for row in cursor.fetchall()]

        material_goals = {}
        for row in results_3:
            material_id = row["material_id"]
            goal = row["goal"]

            if material_id in material_goals:
                material_goals[material_id] += goal
            else:
                material_goals[material_id] = goal

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An unknown error occurred", "details": str(e)}), 500

    return jsonify(
        {"raw": material_goals}
    )

@app.route("/api/schedule", methods=["GET"])
def get_schedule():
    """get the schedule for a given date range
    """
    start_date = request.args.get("start_date")  # 2025-01-08
    end_date = request.args.get("end_date")  # 2025-01-09

    if not start_date or not end_date:
        return (
            jsonify({"error:": "both start_date and end_date parameters are required"}),
            400,
    )

    try:
        # get the production schedule for the full range
        cnx = msc.connect(**IGNITION_DB_CLUSTER)
        cursor = cnx.cursor()    
        query_1 = """
            SELECT date, shift, line, material_id
            FROM production_schedule
            WHERE DATE_FORMAT(date, '%Y-%m') >= DATE_FORMAT(%s, '%Y-%m')
            AND DATE_FORMAT(date, '%Y-%m') <= DATE_FORMAT(%s, '%Y-%m')
        """

        cursor.execute(query_1, (start_date, end_date))

        columns_1 = [desc[0] for desc in cursor.description]  # Get column names
        results_1 = [dict(zip(columns_1, row)) for row in cursor.fetchall()]

        # calculating the monthly schedule
        VIEW_monthly = []
        for row in results_1:
            if len(row["material_id"]) > 3:
                fiber_queue = parse_fiber(row["material_id"])

                for fiber in fiber_queue:
                    VIEW_monthly.append({
                        "date": row["date"],
                        "line": row["line"],
                        "material_id": fiber,
                        "shift": row["shift"],
                        "goal" : fiber_queue[fiber]
                    })
                # print(row["material_id"], parse_fiber(row["material_id"]))

            else:
                VIEW_monthly.append(row)



        fixed_material_frequency = {}
        for row in results_1:
            material_id = row["material_id"]

            if material_id in fixed_material_frequency :
                fixed_material_frequency[material_id] += 1
            else:
                fixed_material_frequency[material_id] = 1     

        parsed_dict = {}
        for key in fixed_material_frequency:
            if len(key) > 3:
                split_keys = key.split()
                for split in split_keys:
                    match = re.match(r"(\d*)([A-Za-z]+)", split)
                    if match:
                        number = int(match.group(1)) if match.group(1) else None  # Convert to int if numeric part exists
                        letters = match.group(2)  # Extract the letter part
                        if number:
                            if letters in parsed_dict:
                                parsed_dict[letters] += number * fixed_material_frequency[key]
                            else:
                                parsed_dict[letters] = number * fixed_material_frequency[key]                 

        fixed_material_frequency= fixed_material_frequency | parsed_dict
        keys_to_delete = [key for key in fixed_material_frequency if len(key) > 3]

        for key in keys_to_delete:
            del fixed_material_frequency[key]

        # get the production schedule for the selecte date range
        cnx = msc.connect(**IGNITION_DB_CLUSTER)
        cursor = cnx.cursor()    
        query_2 = """
            SELECT date, shift, line, material_id
            FROM production_schedule
            WHERE DATE_FORMAT(date, '%Y-%m-%d') >= DATE_FORMAT(%s, '%Y-%m-%d')
            AND DATE_FORMAT(date, '%Y-%m-%d') <= DATE_FORMAT(%s, '%Y-%m-%d')
        """

        cursor.execute(query_2, (start_date, end_date))

        columns_2 = [desc[0] for desc in cursor.description]  # Get column names
        results_2 = [dict(zip(columns_2, row)) for row in cursor.fetchall()]


        material_frequency = {}
        for row in results_2:
            material_id = row["material_id"]

            if material_id in material_frequency :
                material_frequency[material_id] += 1
            else:
                material_frequency[material_id] = 1     
        
        parsed_dict = {}
        for key in material_frequency:
            if len(key) > 3:
                split_keys = key.split()
                for split in split_keys:
                    match = re.match(r"(\d*)([A-Za-z]+)", split)
                    if match:
                        number = int(match.group(1)) if match.group(1) else None  # Convert to int if numeric part exists
                        letters = match.group(2)  # Extract the letter part
                        if number:

                            if letters in parsed_dict:
                                parsed_dict[letters] += number * material_frequency[key]
                            else:
                                parsed_dict[letters] = number * material_frequency[key]                 

        material_frequency = material_frequency | parsed_dict
        keys_to_delete = [key for key in material_frequency if len(key) > 3]

        for key in keys_to_delete:
            del material_frequency[key]

        query_4 = """
            SELECT material_id, goal, date
            FROM production_goals
            WHERE DATE_FORMAT(date, '%Y-%m') >= DATE_FORMAT(%s, '%Y-%m')
            AND DATE_FORMAT(date, '%Y-%m') <= DATE_FORMAT(%s, '%Y-%m')
        """

        cursor.execute(query_4, (start_date, end_date))

        columns_4= [desc[0] for desc in cursor.description]  # Get column names
        results_4 = [dict(zip(columns_4, row)) for row in cursor.fetchall()]
        
        material_goals = {}
        for row in results_4:
            material_id = row["material_id"]
            goal = row["goal"]

            if material_id in material_goals:
                material_goals[material_id] += goal
            else:
                material_goals[material_id] = goal

        material_schedule_rate = {}
        for material_id in fixed_material_frequency:
            if material_id in material_frequency:
                material_schedule_rate[material_id] = material_frequency[material_id] / fixed_material_frequency[material_id] 
            
        query_5 = """
            SELECT material_id, Count(*) / 2 as freq from production_schedule where date >= %s AND date <= %s GROUP BY material_id
        """

        cursor.execute(query_5, (start_date, end_date))

        columns_5= [desc[0] for desc in cursor.description]  # Get column names
        results_5 = [dict(zip(columns_5, row)) for row in cursor.fetchall()]  
        
        days_dict = {}
        for row in results_5:
            if row['material_id'] not in days_dict:
                days_dict[row['material_id']] = row['freq']


    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An unknown error occurred", "details": str(e)}), 500

    return jsonify(
        {"raw": material_goals, "freq": material_frequency, "fixed" : fixed_material_frequency, "rate" : material_schedule_rate, "days": days_dict, "monthly_schedule": VIEW_monthly}
    )


from flask import Flask, jsonify, request
import mysql.connector as msc

@app.route("/api/incoming", methods=["GET"])
def get_incoming():
    try:
        # Establish the database connection
        cnx = msc.connect(**IGNITION_DB_CLUSTER)
        cursor = cnx.cursor()
        
        # SQL query
        query_1 = """
            SELECT
                er.material_id,
                COUNT(er.spool_id) AS total_spools,
                SUM(er.meters_on_spool) AS total_meters_on_spool,
                SUM(er.meters_scanned) AS total_meters_scanned,
                SUM(er.volume) AS volume,
                (SUM(notes) / 1000) AS `KG`,
                (il.mass / (SUM(notes) / 1000) ) AS tabulated_spool_ct,
                SUM(
                    CASE
                        WHEN spec = 'Y' THEN 1
                        WHEN spec = 'N' THEN 0
                        ELSE 0
                    END
                ) AS spec_count,
                er.status,
                flc.feedstock_lot_id,
                il.mass
            FROM extrusion_runs AS er
            JOIN filament_lot_changes AS flc
                ON flc.filament_lot = er.filament_lot
            JOIN incoming_lots AS il
                ON il.lot_id = flc.feedstock_lot_id
            GROUP BY
                er.material_id,
                flc.feedstock_lot_id,
                status
            ORDER BY
                flc.feedstock_lot_id, status
        """
        
        # Execute the query
        cursor.execute(query_1)
        
        # Fetch and process results
        columns_1 = [desc[0] for desc in cursor.description]
        results_1 = [dict(zip(columns_1, row)) for row in cursor.fetchall()]

        # split into dict ...

        material_lots = {
            # material_id 
            #    2410FB2-10891:
            #        0: {
            #        mass: 
            #        volume: 
            #        length: 
            #        status: 
            #    },
            #        1: {
            #        mass: 
            #        volume: 
            #        length: 
            #        status: 
            #    },
            #        2: {
            #        mass: 
            #        volume: 
            #        length: 
            #        status: 
            #    },
        }
        
        # Handle no results
        if not results_1:
            return jsonify({"error": "No data found"}), 404
    
    except msc.errors.ProgrammingError as pe:
        print(f"SQL Syntax Error: {pe}")
        return jsonify({"error": "Database query failed", "details": str(pe)}), 400
    except msc.errors.DatabaseError as db_err:
        print(f"Database Error: {db_err}")
        return jsonify({"error": "A database error occurred", "details": str(db_err)}), 500
    except Exception as e:
        print(f"Unexpected Error: {e}")
        return jsonify({"error": "An unknown error occurred", "details": str(e)}), 500
    finally:
        # Ensure resources are cleaned up
        if cursor:
            cursor.close()
        if cnx:
            cnx.close()
    
    # Return results
    return jsonify(results_1)



if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)


class AnalyticsAPI:
    def __init__(self, app, db_config):
        self.app = app
        self.db_config = db_config
        self.setup_routes()

    
    def connect_db(self):
        """Establish and return a database connection."""
        return msc.connect(**self.db_config)

    def execute_query(self, query, params=None):
        """Reusable method to handle database queries with error handling."""
        try:
            cnx = self.connect_db()
            cursor = cnx.cursor()
            cursor.execute(query, params or [])
            columns = [desc[0] for desc in cursor.description]
            results = [dict(zip(columns, row)) for row in cursor.fetchall()]
            return results
        except msc.errors.ProgrammingError as pe:
            raise RuntimeError(f"SQL Syntax Error: {pe}")
        except msc.errors.DatabaseError as db_err:
            raise RuntimeError(f"Database Error: {db_err}")
        except Exception as e:
            raise RuntimeError(f"Unexpected Error: {e}")
        finally:
            if cursor:
                cursor.close()
            if cnx:
                cnx.close()
    
    def setup_routes(self):
        """Define the API routes."""
        self.app.route("ping", methods=["GET"])(self.api_default)
        self.app.route("/api/goals/extruder", methods=["GET"])(self.get_runtime_goals)
        self.app.route("/api/schedule", methods=["GET"])(self.get_schedule)
        self.app.route("/api/incoming", methods=["GET"])(self.get_incoming)

        
    def api_default():
        import time

        delay = abs(int((random.gauss(0, 1) * 10)))
        time.sleep(delay)

        return jsonify({"pong": f"Hello from the backend! - slept for {delay} seconds"})
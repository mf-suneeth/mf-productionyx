from flask import Flask, jsonify, request
from flask_cors import CORS
import json
from datetime import datetime, timedelta
import base64
import re


app = Flask(__name__)
CORS(app)  # This will allow all domains

# TODO: os.environ["IGNITION_DB_PASSWORD"]
import mysql.connector as msc

from dbconnector import IGNITION_DB_CLUSTER
from dbconnector import FETCH_COA_QUERY

from ingest import ingest, ingest2, ingest3

PRODUCTION_MATRIX = {}

@app.route('/test', methods=['GET'])
def api_default():
    import time

    delay = 10
    time.sleep(delay)

    return jsonify({"testEndpoint":f"Hello from the backend! - slept for {delay} seconds"})

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
        count = ''.join(filter(str.isdigit, fiber))  # Extract digits
        label = ''.join(filter(str.isalpha, fiber))  # Extract letters

        # Update counts in the dictionary
        fibers_out[label] = fibers_out.get(label, '0') + count

    return fibers_out

@app.route('/api/load', methods=['GET'])
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

@app.route('/api/submit', methods=['GET'])
def submit_form():
    """
    Endpoint for creating and writing monthly entries.
    
    This function provides a placeholder endpoint that handles the submission of
    monthly entries to the backend. It doesn't interact with the database in this 
    implementation.
    
    Returns:
    json: A response indicating success or failure.
    """
    return jsonify({"message": "Hello from the backend!"})

@app.route('/api/preview', methods=['POST'])
def preview_data():
    """
    Endpoint for previewing data.
    
    This route accepts POST requests, extracts the provided data, and returns it 
    in the response. It's intended for previewing data before submitting or processing it.
    
    Args:
    data (dict): The input data in JSON format, which contains the 'data' key.

    Returns:
    json: The data sent in the request.
    """
    data = request.get_json()
    return jsonify(data['data'])


@app.route('/api/current', methods=['GET'])
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
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        # Validate and parse dates
        if not start_date or not end_date:
            return jsonify({"error": "start_date and end_date are required"}), 400

        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d')
            end_date = datetime.strptime(end_date, '%Y-%m-%d')
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

        cursor.execute(query, (start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')))
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
                frequency[item["material_id"]] = frequency.get(item["material_id"], 0) + 1

        return jsonify({"scheduled": results, "goals": goals, "frequency": frequency})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An unknown error occurred", "details": str(e)}), 500

@app.route('/api/current/fiber', methods=['GET'])
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
        start_date = request.args.get('start_date')
        start_time = ""
        if not start_date:
            return jsonify({"error": "start_date and end_date are required"}), 400

        try:
            # Parse the input date
            start_time = datetime.strptime(start_date, '%Y-%m-%d')
            
            # Convert the date to YY-MM-DD format
            start_date = start_time.strftime('%Y-%m-%d')

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

        cursor.execute(query, ("%Y-%m-%d %H:%i:%s", "%Y-%m-%d %H:%i:%s", start_date, start_date))

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
            current_time = min_time.replace(minute=0, second=0)  # Round down to the nearest hour
            while current_time <= max_time:
                labels.append(current_time.strftime('%m-%d %H'))
                current_time += timedelta(hours=1)

            current_time = min_time.replace(minute=0, second=0)  # Round down to the nearest hour
            while current_time <= max_time:
                hours_from_target = int((current_time - start_time).total_seconds() // 3600)
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
        return jsonify({"produced": line_data_dict, "range": [min_time, max_time], "step": labels, "delta" : delta})


    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An unknown error occurred", "details": str(e)}), 500  
    
@app.route('/api/current/compounding', methods=['GET'])
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
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        # Validate and parse dates
        if not start_date and end_date:
            return jsonify({"error": "start_date and end_date are required"}), 400

        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d')
            end_date = datetime.strptime(end_date, '%Y-%m-%d')
            

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

        cursor.execute(query_1, ('%Y-%m-%d', start_date, end_date))

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
        
        start_date = start_date.strftime('%Y-%m-%d')

        cursor.execute(query_2, ('%Y-%m-%d', '%Y-%m-%d', f"{start_date}%",))
        
        # Fetch results and process them into a JSON-friendly format
        columns_2 = [desc[0] for desc in cursor.description]  # Get column names
        results_2 = [dict(zip(columns_2, row)) for row in cursor.fetchall()]

        
        group_by_lots = {}
        for obj in results_2:
            # print(obj)
            batch_info = [obj['batch_date'], obj['batch_num'], obj['stage'], obj['batch_id'], obj['batch_mass']]

            if obj['lot_id'] in group_by_lots:
                # just append the subcontainers
                
                if obj['batch_date'] == start_date:
                    group_by_lots[obj['lot_id']]['current'].append(batch_info)
                else:
                    group_by_lots[obj['lot_id']]['historical'].append(batch_info)
                pass
            else:
                historical = []
                current = []

                if obj['batch_date'] == start_date:
                    current.append(batch_info)
                else:
                    historical.append(batch_info)

                # build the subcontainers
                group_by_lots[obj['lot_id']] = {
                    'material_id' : obj['material_id'],
                    "mass" : obj['lot_mass'],
                    'date' : obj['lot_date'],
                    'raw_powder' : obj['raw_powder'],
                    'historical' : historical,
                    'current' : current
                }
                pass
                
        # Close cursor and connection
        cursor.close()
        cnx.close()

        return jsonify({"scheduled": results_1, "produced": group_by_lots, "extra": results_2})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An unknown error occurred", "details": str(e)}), 500  
    

@app.route('/api/current/extrusion', methods=['GET'])
def get_current_day_extrusion():
    """
    Endpoint for retrieving the daily extrusion data.
    
    This function retrieves extrusion data for the current month (or a specified date range),
    counts the occurrences of each status (gs, qc, sc), and returns the results in JSON format.
    
    Returns:
    json: A response containing the extrusion data.
    """
    try:
        cnx = msc.connect(**IGNITION_DB_CLUSTER)
        cursor = cnx.cursor()

        start_date = "2024-11-01"
        end_date = "2024-12-01"

        query = """
            SELECT
                DATE(start_time) AS date,
                line_id,
                material_id,
                COUNT(spool_id) as net,
                COUNT(CASE WHEN status = 0 THEN 1 END) as gs,
                COUNT(CASE WHEN status = 1 THEN 1 END) as qc,
                COUNT(CASE WHEN status = 2 THEN 1 END) as sc
            FROM extrusion_runs
            WHERE start_time BETWEEN %s AND %s
            GROUP BY date, line_id, material_id
            ORDER BY date, line_id, material_id
        """
        cursor.execute(query, (start_date, end_date))

        results = cursor.fetchall()

        # format the results into json
        production_line_date_material_status = {}


        for row in results:
            if len(row) == 7:
                date, line_id, material_id, net, gs, qc, sc = row

                date = str(date)

                if date in production_line_date_material_status:
                    # append to existing structure
                    production_line_date_material_status[date][line_id] = {
                        "material_id" : material_id,
                        "net" : net,
                        "gs" : gs,
                        "qc" : qc,
                        "sc" : sc,
                    }
                else:
                    production_line_date_material_status[date] = {
                        line_id: {
                            "material_id" : material_id,
                            "net" : net,
                            "gs" : gs,
                            "qc" : qc,
                            "sc"  : sc,
                        }
                    }

            else: # TODO: could raise this as a possible error
                print("Unexpected row structure:", row)
                
        cursor.close()
        cnx.close()

        return jsonify({"data": production_line_date_material_status})


    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An unknown error occurred", "details": str(e)}), 500


@app.route('/api/current/goals', methods=['GET'])
def get_current_day_goals(day, line, material):
    """
    Placeholder endpoint for retrieving current day oven data.
    
    This is a placeholder function and does not currently implement any logic.
    
    Args:
    day (str): The day of the week.
    line (str): The production line identifier.
    material (str): The material type.
    
    Returns:
    None
    """
    goals = {"ONX": 8500, "OXL": 60, "OFR" : 340, "172" : 990}
    return jsonify({"goals" : goals})


    pass

@app.route('/api/cal', methods=['GET'])
def produce_data():
    """
    Produce data based on the ingested input and return a production matrix.
    
    This function processes a schedule, extracts relevant material data, and 
    generates a production matrix that includes goals, schedules, and other details.
    
    Returns:
    json: The production matrix in JSON format.
    """
    schedule = [line.split('\t') for line in ingest3.split('\n')]

    month_schedule = {}
    material_freq = {}

    week_stor = ""
    for row in schedule:
        date, week, day, EX00, EX01, EX03, EX04, Compounding, Fiber, Other = row

        week_stor = week if week else week_stor

        if date and day.strip():
            day_key = f"{date}"

            month_schedule[day_key] = {
                "Week": week_stor,
                "EX00": {EX00: ""} if EX00 else {},
                "EX01": {EX01: ""} if EX01 else {},
                "EX03": {EX03: ""} if EX03 else {},
                "EX04": {EX04: ""} if EX04 else {},
                "Compounding": {Compounding: ""} if Compounding else {},
                "Fiber": parse_fiber(Fiber) if Fiber else {},
                "Other": {Other: ""} if Other else {},
            }

            for process, materials in month_schedule[day_key].items():
                if process != "Week" and materials:
                    for material, goal in materials.items():
                        material = material.strip()
                        if material not in material_freq:
                            material_freq[material] = [1, int(goal) if goal else 0]
                        else:
                            material_freq[material][0] += 1
                            material_freq[material][1] += int(goal) if goal else 0

            if day.strip() == "Friday":
                for day in ["Saturday", "Sunday"]:
                    date = int(date) + 1
                    day_key = f"{date}"
                    month_schedule[day_key] = {
                        "Week": week_stor,
                        "EX00": {},
                        "EX01": {},
                        "EX03": {},
                        "EX04": {},
                        "Compounding": {},
                        "Fiber": {},
                        "Other": {},
                    }

    now = datetime.now()
    formatted_date = now.strftime("%m-%Y")

    PRODUCTION_MATRIX.update({
        "Signature": formatted_date,
        "Schedule": month_schedule,
        "Goals": material_freq,
        "Notes": "",
        "Updates": ""
    })

    return json.dumps(PRODUCTION_MATRIX)

@app.route('/api/redo', methods=['POST'])
def overwrite_month():
    """
    Endpoint for overwriting and deleting monthly entries in the database.
    
    This function handles the overwriting and deletion of existing production schedule entries
    for a specific month. It reads input data from the request and updates the database accordingly.
    
    Returns:
    json: A response containing the number of rows added or an error message.
    """
    data = request.get_json()

    if not data or 'selectedDate' not in data or 'input' not in data:
        return jsonify({"error": "Missing required data (selectedDate or schedule)"}), 400
    
    selected_date = data['selectedDate']
    schedule = data['input']

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
        "Fiber" : None,
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
        "17-4V2" : "17F",
        "17-4V2?" : "17F",
        "ONYX FR" : "OFR",
        "INCONEL" : "625"
    }

    format_process_key = {
        "EX00": "EX00",
        "EX01": "EX01",
        "EX03": "EX03",
        "EX04": "EX04",
        "Compounding": "CMP0",
        "Fiber" : "FIBR",
    }

    for row in schedule:
        if len(row) < 3:
            print(f"Skipping malformed row: {row}")
            continue 

        date, week, day, *material_entries = row
        
        material_entries = [entry.replace('*', '').replace('?', '') for entry in material_entries]
        translate_line_material.update(dict(zip(translate_line_material.keys(), material_entries)))



        if date and day.strip():
            day_key = f"{date}"

            date = str(date).zfill(2)

            for line_id, material in translate_line_material.items():
                # print(line_id)
                ## imporove filtering here
                if not material and line_id != "Fiber":
                    continue

                line_id = format_process_key[line_id] if line_id in format_process_key else line_id
                
                for shift in shifts:
                    entry_date = f"{signature}-{date}"
                    entry_id = f"{entry_date}_{shift}_{line_id.upper()}"
                    entry_material = translate_material_mat.get(material.upper()) if line_id != "FIBR" else material

                    if entry_material:
                        entry_row.append([entry_id, entry_date, shift, line_id.upper(), entry_material])

 
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

@app.route('/api/goals/redo', methods=['POST'])
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

    if not data or 'selectedDate' not in data or 'goals' not in data:
        return jsonify({"error": "Missing required data (selectedDate or goals)"}), 400

    
    selected_date = data['selectedDate']
    goals = data['goals']

    date_obj = datetime.strptime(selected_date, '%Y-%m')
    formatted_date = date_obj.replace(day=1)
    formatted_date = formatted_date.strftime('%Y-%m-%d')

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
            cursor.execute(query_stmt, [id, formatted_date, material_id, goals[material_id]])

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

@app.route('/api/extruder', methods=['GET'])
def get_extruder():
    """
    Endpoint for retrieving the daily extrusion data.
    
    This function retrieves extrusion data for the current month (or a specified date range),
    counts the occurrences of each status (gs, qc, sc), and returns the results in JSON format.
    
    Returns:
    json: A response containing the extrusion data.
    """
    line_id = request.args.get('line_id')  # Get 'line_id' from query parameters

    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    print(start_date, end_date)
    
    if not line_id:
        return jsonify({"error": "line_id parameter is required"}), 400
    
    if not start_date or not end_date:
        return jsonify({"error:" : "both start_date and end_date parameters are required"}), 400
    
    if not validate_dates(start_date, end_date):
        return jsonify({"error:" : "Illegal date format"}), 403


    days_diff = datetime.strptime(end_date, '%Y-%m-%d') - datetime.strptime(start_date, '%Y-%m-%d')
    days_diff = days_diff.days

    
    if not re.match(r'^[A-Za-z]{2}\d{2,4}$', line_id):
        return jsonify({"error": "Invalid line_id format. Must be in the format EX**."}), 400
    
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
        cursor.execute(query_1, ('%H:%i:%s','%H:%i:%s','%Y-%m-%d %H:%i:%s', start_date, end_date, line_id))

        columns_1 = [desc[0] for desc in cursor.description]  # Get column names
        rows = [dict(zip(columns_1, row)) for row in cursor.fetchall()]

        # Separate valid rows and errored rows
        results_1 = [row for row in rows]
        errored_1 = [
            row for row in rows
            if any(value in [None, ''] for key, value in row.items() if key != 'load_id')
        ]

        failure_mode_frequency = {}
        ovens_load = {}
        campaign_statistics = {}

        failure_rate = {
            "good_spool" : 0,
            "quality_control" : 0,
            "scrap" : 0,
        }

        materials_produced = []
        campaign_lots = {
            "feedstock": set(), 
            "filament": set()
        }

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
            material_id = row['material_id'] 
            goal = row['goal'] 
            
            if material_id in material_goals:
                material_goals[material_id] += goal
            else:
                material_goals[material_id] = goal

        campaign_statistics["ovens"] = {
            "available" : [row[0] for row in cursor.fetchall()],
            "full" : int(len(results_1) / 66),
            "remainder" : len(results_1) % 66
        }
          
        cursor.close()
        cnx.close()

        return jsonify({"produced": results_1, "scheduled": material_goals, "projected": 100 * days_diff, "active": materials_produced, "failures" : failure_mode_frequency, "statistics" : campaign_statistics, "ovens": ovens_load, "lots": campaign_lots, "errored" : errored_1})


    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An unknown error occurred", "details": str(e)}), 500

@app.route('/api/extruder/live', methods=['GET'])
def get_extruder_live():
    """
    Endpoint for retrieving the live extrusion data.
    
    This function retrieves extrusion data for the current month (or a specified date range),
    counts the occurrences of each status (gs, qc, sc), and returns the results in JSON format.
    
    Returns:
    json: A response containing the extrusion data.
    """
    line_id = request.args.get('line_id')  # Get 'line_id' from query parameters

    # line_id = "EX03"
    
    if not line_id:
        return jsonify({"error": "line_id parameter is required"}), 400

    
    
    if not re.match(r'^[A-Za-z]{2}\d{2,4}$', line_id):
        return jsonify({"error": "Invalid line_id format. Must be in the format EX**."}), 400
    
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

        cursor.execute(query_1, ('%H:%i:%s', '%Y-%m-%d %H:%i:%S', line_id))

        # zip the results into json
        columns_1 = [desc[0] for desc in cursor.description]  # Get column names
        results_1 = [dict(zip(columns_1, row)) for row in cursor.fetchall()]




        for row in results_1:
            if not row['run_time']:  # Check if run_time is not set
                start_time = datetime.strptime(row['start_time'], '%Y-%m-%d %H:%M:%S')  # Convert start_time to datetime
                current_time = datetime.now()  # Get the current time
                run_time = current_time - start_time  # Calculate the difference

                # Get hours, minutes, and seconds from timedelta
                hours, remainder = divmod(run_time.seconds, 3600)  # Divmod to get hours and the remainder
                minutes, seconds = divmod(remainder, 60)  # Get minutes and seconds from remainder

                # Add the hours from the timedelta days (if any)
                hours += run_time.days * 24  # Add the days (in hours) to hours if timedelta spans multiple days

                # Format run_time as HH:MM:SS
                row['run_time'] = f"{hours:02}:{minutes:02}:{seconds:02}"  # Format as 'HH:MM:SS'
                row['run_time_sec'] = run_time.total_seconds()  # Optionally, store the time in seconds
                row['meters_on_spool'] = round(run_time.total_seconds() * 2, 3) if run_time.total_seconds() else 0

        return jsonify({"live": results_1})


    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An unknown error occurred", "details": str(e)}), 500
    
@app.route('/api/schedule/existing', methods=['GET'])
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

if __name__ == '__main__':
    app.run(debug=True)



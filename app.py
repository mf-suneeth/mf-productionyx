from flask import Flask, jsonify, request
from flask_cors import CORS
import json
from datetime import datetime, timedelta
import base64



app = Flask(__name__)
CORS(app)  # This will allow all domains

# TODO: os.environ["IGNITION_DB_PASSWORD"]
import mysql.connector as msc

from dbconnector import IGNITION_DB_CLUSTER
from dbconnector import FETCH_COA_QUERY

from ingest import ingest, ingest2, ingest3

PRODUCTION_MATRIX = {}

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
    return jsonify({"message": "Hello from the backend!"})

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
            print(start_date, end_date)
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

        # Bind the variables when executing the query
        cursor.execute(query, ("%Y-%m-%d %H:%i:%s", "%Y-%m-%d %H:%i:%s", start_date, start_date))


        # # Bind the variables when executing the query
        # cursor.execute(query, ("%Y-%m-%d %H:%i:%s", "%Y-%m-%d %H:%i:%s", f"{start_date}%", f"{start_date}%"))


        # columns = [desc[0] for desc in cursor.description]  # Get column names
        # results = [dict(zip(columns, row)) for row in cursor.fetchall()]

        # Serialize Data -> 

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
        if not start_date or not end_date:
            return jsonify({"error": "start_date and end_date are required"}), 400

        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d')
            end_date = datetime.strptime(end_date, '%Y-%m-%d')
            print(start_date, end_date)
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
            WHERE date >= %s AND date < %s AND (line = 'FIBER' OR line = 'COMPOUNDING')
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

        # return jsonify({"scheduled": results, "goals": goals, "frequency": frequency})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An unknown error occurred", "details": str(e)}), 500  
    
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
            print(start_date, end_date)
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

        # Connect to the database
        cnx = msc.connect(**IGNITION_DB_CLUSTER)
        cursor = cnx.cursor()

        # Query to select data within the date range
        query = """
            SELECT 
                batch_id,
                lot_id,
                stage,
                batch_num,
                mass
            FROM compounding_batches
            WHERE created_at >= %s AND created_at < %s
        """

        cursor.execute(query, (start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')))
        # print(cursor.fetchall())

        # Fetch results and process them into a JSON-friendly format
        columns = [desc[0] for desc in cursor.description]  # Get column names
        produced = [dict(zip(columns, row)) for row in cursor.fetchall()]


        # Close cursor and connection
        cursor.close()
        cnx.close()

        # Example goals

        return jsonify({"scheduled": results, "produced": produced})


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


@app.route('/api/current/ovens', methods=['GET'])
def get_current_day_ovens(day, line, material):
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
        return jsonify({"error": "Missing required data (selectedDate or goals)"}), 400
    
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

if __name__ == '__main__':
    app.run(debug=True)

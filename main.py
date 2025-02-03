from flask import Flask, jsonify, request
from flask_cors import CORS
import json


import mysql.connector as msc
from dbconnector import IGNITION_DB_CLUSTER
from dbconnector import FETCH_COA_QUERY


api = Flask(__name__)
CORS(api)

def fetch(query, params=None, validation=None):
    # fetch rows from ignition db
    try:
        cnx = msc.connect(**IGNITION_DB_CLUSTER)
        cursor = cnx.cursor()

        cursor.execute(query, params)

        columns = [desc[0] for desc in cursor.description]  # Get column names
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]

        return results
   
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


# Enter Schedule routes
@api.route("/schedule/month/update", methods=["POST"]) # - >  replaces api/schedule/redo
def schedule_month():
    
    pass


@api.route("/schedule/month/overview", methods=["GET"]) # - >  resplaces ap/schedule/existing
def get_existing_schedules_dates():

    query =  """
        SELECT DISTINCT EXTRACT(YEAR FROM date) AS year, EXTRACT(MONTH FROM date) AS month
        FROM production_schedule
        ORDER BY year DESC, month DESC;
    """

    params = ()

    fetched_data = fetch(query, params)

    return jsonify({"data" : fetched_data})

    
if __name__ == "__main__":
    api.run(debug=True, port="6000")

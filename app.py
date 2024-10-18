from flask import Flask, jsonify
from flask_cors import CORS
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)  # This will allow all domains

HEADERS = ["EX00",	"EX01",	"EX03",	"EX04",	"Compounding",	"Fiber", "Other"]
PRODUCTION_MATRIX = {}

ingest2 = """	Week #		EX00	EX01	EX03	EX04	Compounding	Fiber	Other
	40	Monday							
1		Tuesday	Copper		ONYX	ONYX		CFU 2CFA 12CAR 4KEV HST 5FIB	OFR unload
2		Wednesday	Copper		ONYX	ONYX		CFU 2CFA 12CAR 4KEV HST 5FIB	UL Audit
3		Thursday	Copper		ONYX	ONYX	D2v2	CFU 2CFA 12CAR 4KEV HST 5FIB	
4		Friday 			ONYX	ONYX	D2v2	CFU 2CFA 12CAR 4KEV HST 5FIB	
			EX00	EX01	EX03	EX04	Compounding	Fiber	Other
7	41	Monday			ONYX	ONYX	D2v2	CFU 2CFA 12CAR 4KEV HST 5FIB	
8		Tuesday	ESDv2		ONYX	ONYX		CFU 2CFA 12CAR 4KEV HST 5FIB	
9		Wednesday	ESDv2		ONYX	ONYX	D2v2	CFU 2CFA 12CAR 4KEV HST 5FIB	
10		Thursday	ESDv2		ONYX	ONYX	D2v2	CFU 2CFA 12CAR 4KEV HST 5FIB	
11		Friday 	ESDv2		ONYX	ONYX		CFU 2CFA 12CAR 4KEV HST 5FIB	
			EX00	EX01	EX03	EX04	Compounding	Fiber	Other
14	42	Monday	D2v2 STG2		ONYX	ONYX	17-4v2	CFU 2CFA 12CAR 4KEV HST 5FIB	
15		Tuesday	D2v2 STG2		ONYX	ONYX	17-4v2	CFU 2CFA 12CAR 4KEV HST 5FIB	
16		Wednesday	G16		ONYX	ONYX	17-4v2	CFU 2CFA 12CAR 4KEV HST 5FIB	
17		Thursday	G16		ONYX	ONYX	17-4v2	CFU 2CFA 12CAR 4KEV HST 5FIB	
18		Friday	G16		ONYX	ONYX	17-4v2	CFU 2CFA 12CAR 4KEV HST 5FIB	NYW
			EX00	EX01	EX03	EX04	Compounding	Fiber	Other
21	43	Monday	G16		ONYX	ONYX	17-4v2	CFU 2CFA 12CAR 4KEV HST 5FIB	
22		Tuesday 	G16		ONYX	ONYX	17-4v2	CFU 2CFA 12CAR 4KEV HST 5FIB	
23		Wednesday	D2v2		ONYX	ONYX	17-4v2	CFU 2CFA 12CAR 4KEV HST 5FIB	
24		Thursday	D2v2		ONYX	ONYX	17-4v2	CFU 2CFA 12CAR 4KEV HST 5FIB	
25		Friday	D2v2		ONYX	ONYX	17-4v2	CFU 2CFA 12CAR 4KEV HST 5FIB	
			EX00	EX01	EX03	EX04	Compounding	Fiber	Other
28	44	Monday	17-4v2STG2		ONYX	ONYX		CFU 2CFA 12CAR 4KEV HST 5FIB	
29		Tuesday 	17-4v2STG2		ONYX	ONYX		CFU 2CFA 12CAR 4KEV HST 5FIB	
30		Wednesday	17-4v2STG2		ONYX XL	ONYX		CFU 2CFA 12CAR 4KEV HST 5FIB	*LOAD XL*
31		Thursday	17-4v2STG2		ONYX XL	ONYX		CFU 2CFA 12CAR 4KEV HST 5FIB	
		Friday							"""
ingest = """ 	 Week #	 	 EX00	 EX01	 EX03	 EX04	 Compounding	 Fiber	 Other
	9	Monday							
		Tuesday							
1		Wednesday			ONYX	ONYX	17-4	0CFU 1CFA 0CAR 1KEV 1HST 0FIB	
2		Thursday			ONYX	ONYX	17-4	0CFU 1CFA 0CAR 1KEV 1HST 0FIB	
3		Friday 			ONYX	ONYX	17-4	0CFU 1CFA 0CAR 1KEV 1HST 0FIB	
			EX00	EX01	EX03	EX04	Compounding	Fiber	Other
6	10	Monday	17-4v2 EC		ONYX	ONYX	Copper	1CFU 1CFA 0CAR 2KEV 1HST 0FIB	
7		Tuesday	17-4v2 EC		ONYX	ONYX	Copper	1CFU 1CFA 0CAR 2KEV 1HST 0FIB	
8		Wednesday	17-4v2 EC		ONYX	ONYX	Copper	1CFU 1CFA 0CAR 2KEV 1HST 0FIB	
9		Thursday	17-4v2 EC		ONYX	ONYX	Copper	1CFU 1CFA 0CAR 2KEV 1HST 0FIB	
10		Friday 	17-4v2 EC		ONYX	ONYX	Copper	1CFU 1CFA 0CAR 2KEV 1HST 0FIB	
			EX00	EX01	EX03	EX04	Compounding	Fiber	Other
13	11	Monday	ESD			ONYX	17-4	2CFU 2CFA 0CAR 2KEV 2HST 0FIB	
14		Tuesday	ESD			ONYX	17-4	2CFU 2CFA 0CAR 2KEV 2HST 0FIB	
15		Wednesday	ESD			ONYX	17-4	2CFU 2CFA 0CAR 2KEV 2HST 0FIB	
16		Thursday	ESD			ONYX	17-4	2CFU 2CFA 0CAR 2KEV 2HST 0FIB	
17		Friday	ESD			ONYX	17-4	2CFU 2CFA 0CAR 2KEV 2HST 0FIB	
			EX00	EX01	EX03	EX04	Compounding	Fiber	Otherz
20	12	Monday	ESD			ONYX	17-4	3CFU 3CFA 0CAR 3KEV 3HST 0FIB	
21		Tuesday 	ESD		ONYX	ONYX	17-4	3CFU 3CFA 0CAR 3KEV 3HST 0FIB	
22		Wednesday	*17-4v2 EC		ONYX	ONYX		3CFU 3CFA 0CAR 3KEV 3HST 0FIB	
23		Thursday	*17-4v2 EC		ONYX	ONYX		3CFU 3CFA 0CAR 3KEV 3HST 0FIB	
24		Friday	*17-4v2 EC		ONYX	ONYX		3CFU 3CFA 0CAR 3KEV 3HST 0FIB	
			EX00	EX01	EX03	EX04	Compounding	Fiber	Other
27	13	Monday	17-4 v1			ONYX		3CFU 3CFA 0CAR 3KEV 3HST 0FIB	
28		Tuesday	17-4 v1			ONYX		3CFU 3CFA 0CAR 3KEV 3HST 0FIB	
29		Wednesday	Metal Lot Quals			ONYX		3CFU 3CFA 0CAR 3KEV 3HST 0FIB	
30		Thursday	8020			ONYX		3CFU 3CFA 0CAR 3KEV 3HST 0FIB	
31		Friday				ONYX		3CFU 3CFA 0CAR 3KEV 3HST 0FIB	"""

def parse_fiber(req):
    """Parse fiber input and return a dictionary with counts."""
    fibers_out = {}
    for fiber in req.split():
        count = ''.join(filter(str.isdigit, fiber))  # Extract digits
        label = ''.join(filter(str.isalpha, fiber))  # Extract letters

        # Update counts in the dictionary
        fibers_out[label] = fibers_out.get(label, '0') + count

    return fibers_out


@app.route('/api/data', methods=['GET'])
def get_data():
    """Endpoint for testing the backend."""
    return jsonify({"message": "Hello from the backend!"})

@app.route('/api/cal', methods=['GET'])
def produce_data():
    """Produce the data based on the ingested input."""
    schedule = [line.split('\t') for line in ingest2.split('\n')]
    month_schedule = {}
    material_freq = {}

    week_stor = ""
    for row in schedule:
        date, week, day, EX00, EX01, EX03, EX04, Compounding, Fiber, Other = row

        # Populate week
        week_stor = week if week else week_stor

        # Handle grey days

        
        if date and day.strip():
            day_key = f"{date} {day}"

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

            # Update material frequencies
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
                    day_key = f"{date} {day}"
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

    # Prepare production matrix
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

if __name__ == '__main__':
    app.run(debug=True)

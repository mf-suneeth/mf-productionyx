import json
from datetime import datetime

# Matches Columns of info
HEADERS = ["EX00",	"EX01",	"EX03",	"EX04",	"Compounding",	"Fiber", "Other"]
PRODUCTION_MATRIX = {}


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
			EX00	EX01	EX03	EX04	Compounding	Fiber	Other
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
    fibers_in = req.split()
    fibers_out = {}
    for fiber in fibers_in:
        count = ''.join(filter(str.isdigit, fiber))  # Extract digits
        label = ''.join(filter(str.isalpha, fiber))  # Extract letters

        # for sanity
        if label not in fibers_out:
            fibers_out[label] = count
        else:
            fibers_out += count

    return fibers_out



schedule = []
for line in ingest.split('\n'):
    daylist = line.split('\t')
    schedule.append(daylist)



# print(schedule)
# header = schedule[0]

# day_template = {
#     "EX00" : "",
#     "EX01" : "",
#     "EX03" : "",
#     "EX04" : "",
#     "Compounding" : "",
#     "Fiber" : "",
#     "Other" : "",
# }

month_schedule = {}
material_freq = {}
material_goals = {}

week_stor = ""
for row in schedule:
    date, week, day, EX00, EX01, EX03, EX04, Compounding, Fiber, Other = row

    # populates week
    if week:
        week_stor = week
    
    # splits fiber data

    if date and len(day.strip()):
        day_key = "{} {}".format(date, day)
        month_schedule[day_key] = {
            "Week" : week if week else week_stor,
            "EX00" : {EX00: ""} if EX00 else {},
            "EX01" : {EX01: ""} if EX01 else {},
            "EX03" : {EX03: ""} if EX03 else {},
            "EX04" : {EX04:""} if EX04 else {},
            "Compounding" : {Compounding: ""} if Compounding else {},
            "Fiber" : parse_fiber(Fiber) if Fiber else {},
            "Other" : {Other: ""} if Other else {},            
        }

        for process in month_schedule[day_key]:
            if process not in ["Week"]:
                    # check to see if there are entries
                if month_schedule[day_key][process]:
                    for material in month_schedule[day_key][process]:
                        # print(material, month_schedule[day_key][process][material])
                        material = material.strip()
                        if material not in material_freq:
                            # [occurences, goal]
                            material_freq[material] = [1, int(month_schedule[day_key][process][material]) if month_schedule[day_key][process][material] else 0]
                        else:
                            material_freq[material][0] +=1
                            material_freq[material][1] += int(month_schedule[day_key][process][material]) if month_schedule[day_key][process][material] else 0


now = datetime.now()
formatted_date = now.strftime("%m-%Y")


PRODUCTION_MATRIX["Signature"] = formatted_date
PRODUCTION_MATRIX["Schedule"] = month_schedule
PRODUCTION_MATRIX["Goals"] = material_freq
PRODUCTION_MATRIX["Notes"] = ""
PRODUCTION_MATRIX["Updates"] = ""


print (json.dumps(PRODUCTION_MATRIX))


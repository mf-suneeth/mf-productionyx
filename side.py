import datetime

# Get the current date
today = datetime.date.today()
# Get the first and last day of the current month
first_day = today.replace(day=1)
last_day = (first_day.replace(month=first_day.month + 1) - datetime.timedelta(days=1)) if first_day.month < 12 else first_day.replace(month=1, year=first_day.year + 1)

# Create a list of days with their corresponding weekdays
days_with_weekdays = []
for day in range(1, last_day.day + 1):
    date = first_day.replace(day=day)
    days_with_weekdays.append(f"{day} {date.strftime('%A')}")

# Print the result
for entry in days_with_weekdays:
    print(entry)

[
    [
        {"1":{"date":"2024-11-18","id":"2024-11-18_1_EX00","line":"EX00","material_id":"ES2","shift":1},
         "2":{"date":"2024-11-18","id":"2024-11-18_2_EX00","line":"EX00","material_id":"ES2","shift":2},
         "3":""},
         
         {"1":{"date":"2024-11-18","id":"2024-11-18_1_EX00","line":"EX00","material_id":"ES2","shift":1},
          "2":{"date":"2024-11-18","id":"2024-11-18_2_EX00","line":"EX00","material_id":"ES2","shift":2},
          "3":""},
          
          {"1":{"date":"2024-11-18","id":"2024-11-18_1_EX00","line":"EX00","material_id":"ES2","shift":1},
           "2":{"date":"2024-11-18","id":"2024-11-18_2_EX00","line":"EX00","material_id":"ES2","shift":2},
           "3":""}
           
           ,{"1":{"date":"2024-11-18","id":"2024-11-18_1_EX00","line":"EX00","material_id":"ES2","shift":1},
             "2":{"date":"2024-11-18","id":"2024-11-18_2_EX00","line":"EX00","material_id":"ES2","shift":2},
             "3":""}
    ],
    
    [
        {"1":{"date":"2024-11-18","id":"2024-11-18_1_EX04","line":"EX04","material_id":"ONX","shift":1},
         "2":{"date":"2024-11-18","id":"2024-11-18_2_EX04","line":"EX04","material_id":"ONX","shift":2},
         "3":""},
         
         {"1":{"date":"2024-11-18","id":"2024-11-18_1_EX04","line":"EX04","material_id":"ONX","shift":1},
          "2":{"date":"2024-11-18","id":"2024-11-18_2_EX04","line":"EX04","material_id":"ONX","shift":2},
          "3":""},
          
          {"1":{"date":"2024-11-18","id":"2024-11-18_1_EX04","line":"EX04","material_id":"ONX","shift":1},
           "2":{"date":"2024-11-18","id":"2024-11-18_2_EX04","line":"EX04","material_id":"ONX","shift":2},
           "3":""},{"1":{"date":"2024-11-18","id":"2024-11-18_1_EX04","line":"EX04","material_id":"ONX","shift":1},"2":{"date":"2024-11-18","id":"2024-11-18_2_EX04","line":"EX04","material_id":"ONX","shift":2},"3":""}]]


const MyComponent = () => {
    return (
 
    );
};

export default MyComponent;

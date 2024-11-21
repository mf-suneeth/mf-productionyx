input = "0CFU 1CFA 0CAR 1KEV 1HST 0FIB"
input2 = "1CFU 1CFA 0CAR 2KEV 1HST 0FIB"
input3 = "2CFU 2CFA 0CAR 2KEV 2HST 0FIB"
input4 = "3CFU 3CFA 0CAR 3KEV 3HST 0FI"



def parse_fiber(req):
    fibers_in = req.split()
    fibers_out = {}
    for fiber in fibers_in:
        count = ''.join(filter(str.isdigit, fiber))  # Extract digits
        label = ''.join(filter(str.isalpha, fiber))  # Extract letters

        fibers_out[label] = count

    print(fibers_out)

parse_fiber(input)

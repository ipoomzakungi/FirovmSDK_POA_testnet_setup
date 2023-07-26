import subprocess
import os
from dotenv import load_dotenv
load_dotenv()


# Function to execute shell commands
def execute_command(command):
    print(f"Executing command: {command}")
    try:
        subprocess.run(command, shell=True, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error executing command: {command}")
        print(e)

# Run the initial command
execute_command('node ./initcontract.js')

# Array list of addresses
addresses = os.environ['MINER_ADDRESS'].split(',')
# print(addresses)
# Loop through the array and execute the commands
for address in addresses:
    execute_command(f'node ./addminer.js {address} 1')

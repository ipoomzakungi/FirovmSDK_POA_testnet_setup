# PoA Setup Using SDK

This github is going to show the walkthrough how can setup and add the UTXO of miner to whitelist

## Prerequisites

Use the package manager to install `firovmSDK` and dependencies.

```bash
npm i
npm i firovm-sdk
```

## Setting up
### Create admin address
by running the command  
``` 
node ./admin.js
```
the result gonna look like this
```
Admin1:
{
    "network": 1,
    "privkey": {
        "bn": "3b443a302140f3427c4d40a36c57dd43cf3371eda642607e18da852f827b09ff",
        "compressed": true,
        "network": "testnet"
    },
    "mnemonic": "own beyond runway rely craft garlic song dust hazard unit rare mango",
    "hdPath": "m/44'/1'/0'/0/0"
}
Admin2:
{
    "network": 1,
    "privkey": {
        "bn": "c58a414cefafb0d2d8a35f5e96db377487590e111cfff590051e660049ea1fd7",
        "compressed": true,
        "network": "testnet"
    },
    "mnemonic": "chicken loop harbor next pigeon giraffe play enable twice faint online priority",
    "hdPath": "m/44'/1'/0'/0/0"
}
``` 
**saving this to the safe place**
### create .env
create `.env` by this pattern
```
RPC_USERNAME=username
RPC_PASSWORD=password
RPC_IP=1xx.xx.xxx.xxx
RPC_PORT=1234

ADMIN1_PRIVKEY=a8235469...9d8d2ff
ADMIN2_PRIVKEY=94...d5799a

MINER_ADDRESS=addr1,addr2,addr3,...
```
### Vairable explaination
- `RPC_USERNAME` is your `rpcuser` in `firovm.conf`.
- `RPC_PASSWORD` is your `rpcpassword` in `firovm.conf`.
- `RPC_IP` is ip where the firovm daemon running at.
- `RPC_PORT` is your `rpcport` in `firovm.conf`.  
**note** this port must expose in the `Dockerfile` , port mapping in Dockercompse.yml too

- `ADMIN1_PRIVKEY` is your Admin1 Private key that got from [##CreateAdminAddress](#markdown-header-create-admin-address).
- `ADMIN2_PRIVKEY` is your Admin2 Private key that got from [##CreateAdminAddress].
- `MINER_ADDRESS` is your miner address that got from generating address in miner node.

## Usage
### What the script doing ?
After setting everything up now we have to know about the script. what it take part in this ?  
you gonna see the `run_script.py` that look like this
```python
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

```

- first its going to run the `node ./initcontract.js` which going to generate 700 block. and setting up the contract by adding your admin1 and admin2 to the admin list.  
( you can change the block generate from 700 to 2500 if your mature age is 2000 )

- next this script gonna call `./addminer.js` with the parameter  
  - `{address}` is the address of miner that we want to give UTXO to.
  - `1` this the number of UTXO that we want to generate to this address.  
     in this term i want to genrate only one

### Run the script file
after we know how the script work. lets run the script.  
by this command
```bash
python ./run_script.py
```




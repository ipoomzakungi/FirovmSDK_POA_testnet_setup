const { Client, Contract, PrivkeyAccount, Network, Context } = require("firovm-sdk");
const { RPCClient } = require("firovm-sdk/lib/rpc.js");
const fs = require("fs");
const { constrainedMemory } = require("process");
require('dotenv').config();

// Client initialization
const url = `http://${process.env.RPC_USERNAME}:${process.env.RPC_PASSWORD}@${process.env.RPC_IP}:${process.env.RPC_PORT}`;
const client = new Client(url);
const rpcClient = new RPCClient(url);

// Define variable
const qtumGovAbi = JSON.parse(
  fs.readFileSync("./abi/qtumGovABI.json", "utf-8")
);
const minerListAbi = JSON.parse(fs.readFileSync("./abi/poaABI.json", "utf-8"));
const mobileAbi = JSON.parse(
  fs.readFileSync("./abi/mobileValABI.json", "utf-8")
);

const qtumGovContract = new client.Contract(
  qtumGovAbi,
  "0x0000000000000000000000000000000000000083"
);
const minerListContract = new client.Contract(
  minerListAbi,
  "0x0000000000000000000000000000000000000880"
);
const mobileContract = new client.Contract(
  mobileAbi,
  "0x0000000000000000000000000000000000000881"
);

const YOUR_ADMIN1_ACCOUNT = new PrivkeyAccount(
  new Context().withNetwork(Network.Testnet),
  `${process.env.ADMIN1_PRIVKEY}`
);

const YOUR_ADMIN2_ACCOUNT = new PrivkeyAccount(
  new Context().withNetwork(Network.Testnet),
  `${process.env.ADMIN2_PRIVKEY}`
);
YOUR_ADMIN2_ADDRESS=YOUR_ADMIN2_ACCOUNT.hex_address()
// console.log(JSON.stringify(YOUR_ADMIN2_ADDRESS))
// console.log(`${YOUR_ADMIN2_ADDRESS}`)

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function initializeContracts() {
  // 1. Set initial admin
  await rpcClient.generateToAddress(700, `${YOUR_ADMIN1_ACCOUNT.address()}`,300000000)
    .then(response => console.log(response))
    .catch(error => console.log(error));
  await sleep(2000);

  let response = await qtumGovContract.methods
    .setInitialAdmin()
    .send({ from: YOUR_ADMIN1_ACCOUNT });
  console.log("Set initial admin " + response);

  rpcClient.generateToAddress(1, `${YOUR_ADMIN1_ACCOUNT.address()}`)
  await sleep(2000);

  // 2. Set QtumGov address to MinerList and Mobile contracts
  response = await minerListContract.methods
    .setDGPContract(qtumGovContract.address)
    .send({ from: YOUR_ADMIN1_ACCOUNT });
  console.log("Set QtumGov " + response);

  rpcClient.generateToAddress(1, `${YOUR_ADMIN1_ACCOUNT.address()}`)
  await sleep(2000);

  response = await mobileContract.methods
    .setDGPContract(qtumGovContract.address)
    .send({ from: YOUR_ADMIN1_ACCOUNT });
  console.log("MinerList " + response);

  rpcClient.generateToAddress(1, `${YOUR_ADMIN1_ACCOUNT.address()}`)
  await sleep(2000);

  // 3. Set Miner and Mobile contracts on QtumGov
  response = await qtumGovContract.methods
    .setContracts(minerListContract.address, mobileContract.address)
    .send({ from: YOUR_ADMIN1_ACCOUNT });
  console.log("Miner and Mobile " + response);

  rpcClient.generateToAddress(1, `${YOUR_ADMIN1_ACCOUNT.address()}`)
  await sleep(2000);

  // 4. Add one more admin
  response = await qtumGovContract.methods
    .addAddressProposal(`${YOUR_ADMIN2_ADDRESS}`, 0)
    .send({ from: YOUR_ADMIN1_ACCOUNT });
  console.log("Add one more admin " + response);

  rpcClient.generateToAddress(1, `${YOUR_ADMIN1_ACCOUNT.address()}`)
}

initializeContracts();

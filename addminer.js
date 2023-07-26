const {
  Client,
  Contract,
  PrivkeyAccount,
  Network,
  Context,
  Unit,
} = require("firovm-sdk");
const { RPCClient } = require("firovm-sdk/lib/rpc.js");
const fs = require("fs");
const ethers = require("ethers");
require("dotenv").config();

async function runScript() {
  // Initialize client and accounts
  const inputAddress = process.argv[2];
  const inputUTXO = process.argv[3];

  const url = `http://${process.env.RPC_USERNAME}:${process.env.RPC_PASSWORD}@${process.env.RPC_IP}:${process.env.RPC_PORT}`;
  const client = new Client(url);
  const rpcClient = new RPCClient(url);
  const minerListAbi = JSON.parse(
    fs.readFileSync("./abi/poaABI.json", "utf-8")
  );
  const minerListContract = new client.Contract(
    minerListAbi,
    "0x0000000000000000000000000000000000000880"
  );

  const context = new Context().withNetwork(Network.Testnet);
  const admin1 = new PrivkeyAccount(context, `${process.env.ADMIN1_PRIVKEY}`);
  const admin2 = new PrivkeyAccount(context, `${process.env.ADMIN2_PRIVKEY}`);
  const address = inputAddress;
  let admin1Address = await admin1.address();
  let admin2Address = await admin2.address();

  // Convert address to hex
  const hexAddressObj = await rpcClient.getHexAddress(address);
  const hexAddress = hexAddressObj.result;

  await rpcClient.generateToAddress(1, `${admin1Address}`);
  // Generate UTXOs
  console.log("Generating UTXOs ...");
  const feePerKb = Unit.fromFVM(0.01).toSatoshis();
  // send some UTXO to address admin2
  // because admin2 need money when gonna vote
  await client.sendFrom(
    admin1,
    [
      {
        to: admin2Address,
        value: Unit.fromFVM(1000).toSatoshis(),
      },
    ],
    { feePerKb }
  );
  await rpcClient.generateToAddress(1, `${admin1Address}`);

  // send some UTXO to miner address
  for (let i = 0; i < inputUTXO; i++) {
    console.log("sending UTXO " + (i + 1) + " to " + address);

    await client.sendFrom(
      admin1,
      [
        {
          to: address,
          value: Unit.fromFVM(100).toSatoshis(),
        },
      ],
      { feePerKb }
    );
    // if (i % 10 === 0) {
    //     await rpcClient.generateToAddress(1,  `${admin1Address}`);
    // }
    await rpcClient.generateToAddress(1, `${admin1Address}`);
  }

  console.log("Getting UTXOs from miner address ...");
  // Get UTXOs for the address
  let utxos = await client.getUtxos(address);
  // let jsonUTXO = JSON.stringify(utxos);
  // console.log("jsonUTXO " + jsonUTXO);
  let transformedUtxos = utxos.map((utxo) => ({
    index: utxo.outputIndex,
    txId: "0x" + utxo.txid,
    // add more properties here if needed...
  }));
  // console.log("transformedUtxos " + transformedUtxos);

  // Propose miner
  console.log("Creating proposal ...");
  let response = await minerListContract.methods
    .proposeMiner(hexAddress, transformedUtxos, 1)
    .send({ from: admin1 });
  console.log("proposeMiner " + response);
  await rpcClient.generateToAddress(1, `${admin1Address}`);

  // Retrieve transaction receipt
  let receipt = await rpcClient.getTransactionReceipt(response);
  // console.log("getTransactionReceipt " + JSON.stringify(receipt));
  // console.log("result_data " + JSON.stringify(receipt.result[0].log[0].data));
  let proposalId = JSON.stringify(receipt.result[0].log[0].data);
  if (!proposalId) {
    console.log("Failed to create proposal");
    return;
  }
  console.log("Proposal Id: ", proposalId);
  const proposalId_hex = "0x" + proposalId.slice(1, -1);

  // Vote
  console.log("Voting ...");
  let voteResponse = await minerListContract.methods
    .vote(proposalId_hex, 1)
    .send({ from: admin2 });
  console.log("Vote: " + voteResponse);

  // Generate a block
  await rpcClient.generateToAddress(1, `${admin1Address}`);

  // Retrieve transaction receipt
  let voteReceipt = await rpcClient.getTransactionReceipt(voteResponse);
  // console.log("getTransactionReceipt " + JSON.stringify(voteReceipt));

  if (voteReceipt.error !== null) {
    console.error("Transaction Error:", voteReceipt.error);
    return;
  }

  if (voteReceipt.result[0].excepted !== "None") {
    console.error(
      "Transaction Exception:",
      voteReceipt.result[0].excepted
    );
    return;
  }

  if (voteReceipt.result[0].exceptedMessage !== "") {
    console.error(
      "Transaction Exception Message:",
      voteReceipt.result[0].exceptedMessage
    );
    return;
  }

  // Add one more for re-adding
  await client.sendFrom(
    admin1,
    [
      {
        to: address,
        value: Unit.fromFVM(100).toSatoshis(),
      },
    ],
    { feePerKb }
  );

  await rpcClient.generateToAddress(1, `${admin1Address}`);

  console.log("Success to add miner ", address);


  console.log("Checking usable first UTXO ");
  //console.log("transformedUtxos[0].txId", transformedUtxos[0].txId);
  
  let responseUsable = await minerListContract.methods
    .usable(hexAddress, transformedUtxos[0].txId, 0)
    .call({ from: `${admin1Address}` });
  console.log("responseUsable :", responseUsable['0']);


  
}

runScript().catch(console.error);

const { MnemonicAccount, Context, Network, Client } = require("firovm-sdk");
require('dotenv').config();

const context = new Context().withNetwork(Network.Testnet);

// console.log(`RPC IP: ${process.env.RPC_IP}`);
// console.log(`RPC PORT: ${process.env.RPC_PORT}`);
// console.log(`RPC USERNAME: ${process.env.RPC_USERNAME}`);
// console.log(`RPC PASSWORD: ${process.env.RPC_PASSWORD}`);
// Client initialization
const client = new Client({
    url: `${process.env.RPC_IP}:${process.env.RPC_PORT}`,  // replace with your node URL
    account: `${process.env.RPC_USERNAME}`,  // replace with your account name
    password: `${process.env.RPC_PASSWORD}`,  // replace with your account password
    timeout: 30000 // optional, default is set to 30000
});

// Generate Mnemonic for Admin1
const admin1 = new MnemonicAccount(context);
const str1 = JSON.stringify(admin1, null, 4); // (Optional) beautiful indented output.
console.log(str1); // Logs output to dev tools console.

console.log(`Admin1 Mnemonic: ${admin1.mnemonic}`); // backup this
console.log(`Admin1 Native Address: ${admin1.address()}`); // Native address
console.log(`Admin1 Hex Address: ${admin1.hex_address()}`); // Hex address

// Generate Mnemonic for Admin2
const admin2 = new MnemonicAccount(context);
console.log(`Admin2:\n ${admin1}`); // backup this
const str2 = JSON.stringify(admin2, null, 4); // (Optional) beautiful indented output.
console.log(str2); // Logs output to dev tools console.

console.log(`Admin2 Mnemonic: ${admin2.mnemonic}`); // backup this
console.log(`Admin2 Native Address: ${admin2.address()}`); // Native address
console.log(`Admin2 Hex Address: ${admin2.hex_address()}`); // Hex address

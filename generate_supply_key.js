const { PrivateKey } = require("@hashgraph/sdk");

// Generate a new ED25519 private key
const supplyKey = PrivateKey.generateED25519();

// Print it to the console
console.log("Generated supply key:", supplyKey.toString());

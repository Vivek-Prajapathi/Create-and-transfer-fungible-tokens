// create_and_transfer_Fungible_token.js
const {
    Hbar,
    Client,
    PrivateKey,
    AccountBalanceQuery,
    AccountCreateTransaction,
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType,
    TokenAssociateTransaction,
    TransferTransaction,
    TokenMintTransaction,
  } = require("@hashgraph/sdk");
  require("dotenv").config();
  
  async function main() {
    try {
      const myAccountId = process.env.MY_ACCOUNT_ID;
      const myPrivateKey = process.env.MY_PRIVATE_KEY;
  
      if (!myAccountId || !myPrivateKey) {
        throw new Error("Set MY_ACCOUNT_ID and MY_PRIVATE_KEY in .env");
      }
  
      const client = Client.forTestnet();
      client.setOperator(myAccountId, myPrivateKey);
      client.setDefaultMaxTransactionFee(new Hbar(100));
      client.setDefaultMaxQueryPayment(new Hbar(50));
  
      // Create new account (payer = operator)
      const newAccountKey = PrivateKey.generateED25519();
      const newAccountTx = await new AccountCreateTransaction()
        .setKey(newAccountKey.publicKey)
        .setInitialBalance(Hbar.fromTinybars(1000))
        .execute(client);
  
      const newAccountReceipt = await newAccountTx.getReceipt(client);
      const newAccountId = newAccountReceipt.accountId;
      console.log("New account ID:", newAccountId.toString());
  
      // generate supply key (used to mint/burn)
      const supplyKey = PrivateKey.generateED25519();
  
      // CREATE FUNGIBLE TOKEN
      const tokenCreateTx = await new TokenCreateTransaction()
        .setTokenName("USD Bar")
        .setTokenSymbol("USDB")
        .setTokenType(TokenType.FungibleCommon)
        .setDecimals(2)
        .setInitialSupply(10000)           // with 2 decimals, this is 100.00
        .setTreasuryAccountId(myAccountId) // treasury holds initial supply
        .setSupplyType(TokenSupplyType.Infinite)
        .setSupplyKey(supplyKey)
        .freezeWith(client);
  
      // Sign with treasury (operator) key
      const tokenCreateSigned = await tokenCreateTx.sign(PrivateKey.fromString(myPrivateKey));
      const tokenCreateSubmit = await tokenCreateSigned.execute(client);
      const tokenCreateRx = await tokenCreateSubmit.getReceipt(client);
      const tokenId = tokenCreateRx.tokenId;
      console.log(`- Created token with ID: ${tokenId}`);
  
      // Associate token to new account (new account must sign)
      const associateTx = await new TokenAssociateTransaction()
        .setAccountId(newAccountId)
        .setTokenIds([tokenId])
        .freezeWith(client);
  
      const associateSigned = await associateTx.sign(newAccountKey);
      const associateSubmit = await associateSigned.execute(client);
      const associateRx = await associateSubmit.getReceipt(client);
      console.log("Association status:", associateRx.status.toString());
  
      // Check balances (use Map.get)
      const treasuryBalance = await new AccountBalanceQuery().setAccountId(myAccountId).execute(client);
      const newAcctBalance = await new AccountBalanceQuery().setAccountId(newAccountId).execute(client);
      console.log(`- Treasury balance: ${treasuryBalance.tokens.get(tokenId.toString())} units`);
      console.log(`- New account balance: ${newAcctBalance.tokens.get(tokenId.toString())} units`);
  
      // Transfer 10 units from treasury to new account (treasury must sign)
      const transferTx = await new TransferTransaction()
        .addTokenTransfer(tokenId, myAccountId, -10)
        .addTokenTransfer(tokenId, newAccountId, 10)
        .freezeWith(client);
  
      const transferSigned = await transferTx.sign(PrivateKey.fromString(myPrivateKey));
      const transferSubmit = await transferSigned.execute(client);
      const transferRx = await transferSubmit.getReceipt(client);
      console.log("Transfer status:", transferRx.status.toString());
  
      // Check balances again
      const treasuryBalance2 = await new AccountBalanceQuery().setAccountId(myAccountId).execute(client);
      const newAcctBalance2 = await new AccountBalanceQuery().setAccountId(newAccountId).execute(client);
      console.log(`- Treasury balance: ${treasuryBalance2.tokens.get(tokenId.toString())} units`);
      console.log(`- New account balance: ${newAcctBalance2.tokens.get(tokenId.toString())} units`);
  
      console.log("Done.");
    } catch (err) {
      console.error("Error:", err);
    }
  }
  
  main();
  
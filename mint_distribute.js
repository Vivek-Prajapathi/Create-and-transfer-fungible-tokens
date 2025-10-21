const {
    Hbar,
    Client,
    PrivateKey,
    AccountBalanceQuery,
    AccountCreateTransaction,
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType,
    TokenMintTransaction,
    TokenAssociateTransaction,
    TransferTransaction,
} = require("@hashgraph/sdk");
require("dotenv").config();

async function environmentSetup() {
    // Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    if (myAccountId == null || myPrivateKey == null) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }

    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);
    client.setDefaultMaxTransactionFee(new Hbar(100));
    client.setDefaultMaxQueryPayment(new Hbar(50));

    // Create new account
    const newAccountPrivateKey = PrivateKey.generateED25519();
    const newAccountPublicKey = newAccountPrivateKey.publicKey;

    const newAccount = await new AccountCreateTransaction()
        .setKey(newAccountPublicKey)
        .setInitialBalance(Hbar.fromTinybars(1000))
        .execute(client);

    const getReceipt = await newAccount.getReceipt(client);
    const newAccountId = getReceipt.accountId;
    console.log("\nNew account ID: " + newAccountId);

    const supplyKey = PrivateKey.generate();

    // Create fungible token
    const tokenCreateTx = await new TokenCreateTransaction()
        .setTokenName("MyToken")
        .setTokenSymbol("MTK")
        .setTokenType(TokenType.FungibleCommon)
        .setDecimals(2)                 // e.g., 2 decimal places
        .setInitialSupply(1000)         // initial supply in smallest units
        .setTreasuryAccountId(myAccountId)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(10000)
        .setSupplyKey(supplyKey)
        .freezeWith(client);

    console.log(`-Supply Key: ${supplyKey}\n`);

    const tokenCreateTxSign = await tokenCreateTx.sign(PrivateKey.fromString(myPrivateKey));
    const tokenCreateSubmit = await tokenCreateTxSign.execute(client);
    const tokenCreateRx = await tokenCreateSubmit.getReceipt(client);
    const tokenId = tokenCreateRx.tokenId;

    console.log("Created Fungible Token with Token ID: " + tokenId);

    // Mint more tokens (optional)
    const maxTransactionFee = new Hbar(20);
    const mintTx = new TokenMintTransaction()
        .setTokenId(tokenId)
        .setAmount(500)  // Mint 500 additional tokens
        .setMaxTransactionFee(maxTransactionFee)
        .freezeWith(client);

    const mintTxSign = await mintTx.sign(supplyKey);
    const mintTxSubmit = await mintTxSign.execute(client);
    const mintRx = await mintTxSubmit.getReceipt(client);
    console.log(`Minted 500 more tokens. Status: ${mintRx.status}`);

    // Associate the new account
    const associateAccountTx = await new TokenAssociateTransaction()
        .setAccountId(newAccountId)
        .setTokenIds([tokenId])
        .freezeWith(client)
        .sign(newAccountPrivateKey);

    const associateAccountTxSubmit = await associateAccountTx.execute(client);
    const associateAccountRx = await associateAccountTxSubmit.getReceipt(client);
    console.log(`Token association with new account: ${associateAccountRx.status}\n`);

    // Check balances before transfer
    const treasuryBalanceBefore = await new AccountBalanceQuery().setAccountId(myAccountId).execute(client);
    console.log(`Treasury balance: ${treasuryBalanceBefore.tokens.get(tokenId.toString())} tokens of ID ${tokenId}`);

    const newAccountBalanceBefore = await new AccountBalanceQuery().setAccountId(newAccountId).execute(client);
    console.log(`New account balance: ${newAccountBalanceBefore.tokens.get(tokenId.toString())} tokens of ID ${tokenId}`);

    // Transfer tokens from treasury to new account
    const tokenTransferTx = await new TransferTransaction()
        .addTokenTransfer(tokenId, myAccountId, -100) // subtract 100 from treasury
        .addTokenTransfer(tokenId, newAccountId, 100) // add 100 to new account
        .freezeWith(client)
        .sign(PrivateKey.fromString(myPrivateKey));

    const tokenTransferSubmit = await tokenTransferTx.execute(client);
    const tokenTransferRx = await tokenTransferSubmit.getReceipt(client);
    console.log(`\nToken transfer from Treasury to New Account: ${tokenTransferRx.status} \n`);

    // Check balances after transfer
    const treasuryBalanceAfter = await new AccountBalanceQuery().setAccountId(myAccountId).execute(client);
    console.log(`Treasury balance: ${treasuryBalanceAfter.tokens.get(tokenId.toString())} tokens of ID ${tokenId}`);

    const newAccountBalanceAfter = await new AccountBalanceQuery().setAccountId(newAccountId).execute(client);
    console.log(`New account balance: ${newAccountBalanceAfter.tokens.get(tokenId.toString())} tokens of ID ${tokenId}`);
}

environmentSetup();


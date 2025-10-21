# Create-and-transfer-fungible-tokens

A simple project demonstrating how to **create, manage, and transfer fungible tokens** on the **Hedera Hashgraph Testnet** using the JavaScript SDK. It provides a hands-on example for developers to learn the **Hedera Token Service (HTS)** and implement digital assets or in-app tokens.

---

## **Features**

- ✅ Create fungible tokens with custom name, symbol, and supply type  
- ✅ Associate tokens with Hedera accounts  
- ✅ Transfer tokens between accounts  
- ✅ Query account balances to verify token distribution  
- ✅ Configurable initial supply and infinite/finite supply type  
- ✅ Uses `.env` for secure storage of Hedera credentials  

---
# Setup Environment Variables
Create a .env file with your Hedera Testnet credentials:
MY_ACCOUNT_ID=0.0.xxxxx
MY_PRIVATE_KEY=your_private_key_here

# Run the Script
node fungible_token.js

# Verify Balances (Optional)
Check token balances using AccountBalanceQuery in the script or via the Hedera Testnet portal.

# Notes
Modify token name, symbol, initial supply, and supply type in the script.
Ensure your account has enough Hbar for transaction fees.
You can create new testnet accounts programmatically for testing

# Expected output
New account ID: 0.0.5046652
- Created token with ID: 0.0.5046653

Transaction Of Association Status Was: 22
- Treasury balance: 10000 units of token ID 0.0.5046653
- New account balance: 0 units of token ID 0.0.5046653

Transaction Status For Transfer Was: 22
- Treasury balance: 9990 units of token ID 0.0.5046653
- New account balance: 10 units of token ID 0.0.5046653
 # What Each Line Means
New account ID:
If you created a new testnet account programmatically, this shows its ID.
Created token with ID:
The newly created fungible token’s ID on Hedera.
Transaction Of Association Status:
Shows whether the token was successfully associated with the new account (22 = SUCCESS).
Treasury & New account balances:
Displays the token balances after creation and after transfer.
Transaction Status For Transfer:
Shows whether the token transfer succeeded (22 = SUCCESS).

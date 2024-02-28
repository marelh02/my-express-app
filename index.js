const express = require('express');
const {AccountId, PrivateKey, AccountCreateTransaction,Client, PublicKey,Hbar} = require("@hashgraph/sdk");
const {json, urlencoded} = require("body-parser");

const app = express();
const port = 3000;

app.use(json());
app.use(
    urlencoded({
      extended: true,
    }),
);

const operatorId = AccountId.fromString("0.0.3608076");
const operatorKey = PrivateKey.fromStringECDSA("3030020100300706052b8104000a04220420d1c98cb7497b59552c6fd9c591fee27a5e5cbf8baac691b1f1644a56c2ea3768");
let client = null

// const verificationCodeFilePath = path.join(__dirname, '.well-known', 'walletconnect.txt');
// Define a route to serve the verification text file
/*app.get('/.well-known/walletconnect.txt', (req, res) => {
  // Read the verification text file
  fs.readFile(verificationCodeFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      res.status(500).send('Internal Server Error');
    } else {
      // Send the content of the verification text file as the response
      res.send(data);
    }
  });
});*/

async function execTxFromBytes(pubKeyString, client){
  console.log("New account about to be added")
  const tx= await new AccountCreateTransaction()
      .setKey(PublicKey.fromStringECDSA(pubKeyString))
      .setInitialBalance(new Hbar(0))
      .execute(client)
  const accountId = (await tx.getReceipt(client)).accountId
  console.log("New account created with Id: "+accountId)
  return accountId
}

app.post('/sign-and-execute', async (req, res) => {
  try {
    const data = req.body.data
    console.log(data)
    const accountId = await execTxFromBytes(data, client);

    res.status(200).json({ "accountId":accountId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Start the Express server
app.listen(port, () => {

  client = Client.forTestnet().setOperator(operatorId, operatorKey);

  console.log(`Express server listening at http://localhost:${port}`);
});

const Cognito = require("@aws-sdk/client-cognito-identity-provider");

const clientId = "d8ng8gora28qtlghnn5g3m1kj"; // match signUp.js
const username = "sam";  // Match signUp.js
const confirmationCode = "733657"; // obtain from your email

async function main() {
    const client = new Cognito.CognitoIdentityProviderClient({ region: 'ap-southeast-2' });
  const command2 = new Cognito.ConfirmSignUpCommand({
    ClientId: clientId,
    Username: username,
    ConfirmationCode: confirmationCode,
  });

  res2 = await client.send(command2);
  console.log(res2);

}

main();

const Cognito = require("@aws-sdk/client-cognito-identity-provider");

const clientId = "d8ng8gora28qtlghnn5g3m1kj";  // Obtain from the AWS console
const username = "sam";
const password = "Password123!";
const email = "samuel.nance@icloud.com";

async function main() {
  console.log("Signing up user");
  const client = new Cognito.CognitoIdentityProviderClient({ region: 'ap-southeast-2' });
  const command = new Cognito.SignUpCommand({
    ClientId: clientId,
    Username: username,
    Password: password,
    UserAttributes: [{ Name: "email", Value: email }],
  });
  const res = await client.send(command);
  console.log(res);
}

main();

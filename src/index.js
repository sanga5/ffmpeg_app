require("dotenv").config();
const DynamoDB = require("@aws-sdk/client-dynamodb");
const DynamoDBLib = require("@aws-sdk/lib-dynamodb");

const qutUsername = "n11611553@qut.edu.au";
const tableName = "n11611553-assignment";
const sortKey = "name";

const { DynamoDBClient, CreateTableCommand, GetCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({ region: 'ap-southeast-2' });
const ddbDocClient = DynamoDBDocumentClient.from(client);


// Create the DynamoDB table
const createTableCommand = new CreateTableCommand({
   TableName: tableName,
   AttributeDefinitions: [
      {
         AttributeName: "qut-username",
         AttributeType: "S",
      },
      {
         AttributeName: sortKey,
         AttributeType: "S",
      },
   ],
   KeySchema: [
      {
         AttributeName: "qut-username",
         KeyType: "HASH",
      },
      {
         AttributeName: sortKey,
         KeyType: "RANGE",
      },
   ],
   ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
   },
});

// Send the command to create the table
(async () => {
   try {
      const response = await client.send(createTableCommand);
      console.log("Create Table command response:", response);
   } catch (err) {
      console.log(err);
   }
})();

// Function to log a file for a user
async function logFileForUser(qutUsername, filename) {
   const fileId = uuidv4();
   const timestamp = new Date().toISOString();
   const putCommand = new DynamoDBLib.PutCommand({
      TableName: tableName,
      Item: {
         "qut-username": qutUsername,
         [sortKey]: fileId,
         "filename": filename,
         "timestamp" : timestamp,
     },
   });

   try {
      const response = await ddbDocClient.send(putCommand);
      console.log("PutCommand response:", response);
   } catch (err) {
      console.log(err);
   }
}

module.exports = {
   logFileForUser
};


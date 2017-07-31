# DriveTransfer
This web app will allow Google Drive users to transfer file ownership in bulk.

## Setting up for development
1. [Install mongoDB](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/)
2. [Establish a replica set](https://www.npmjs.com/package/mongo-oplog)
3. Clone this repo
4. Add the needed config.js to local_modules/shared.
5. Run `npm install` for request-server
6. Run `npm install` for task-server
7. Run `npm install` for client
8. Run the mongo server, ensuring it is accessible using the keys in config.js
9. Log in to Chrome as drivetransfer@edmonton.ca
10. Run `npm run dev` for both client and request-server
11. [Open the application](http://localhost:3000)
12. Log in
13. Run `npm run dev` for the task-server

At this point, all servers should be working and the client should be building.

## Client

The client is a very small web form that uses React. It has a web socket connection to the request-server and also issues some simple API calls to the request server. It has no method of communicating directly with the task server.

## Request Server

The request server handles all direct interaction with clients. This includes authenticating users using OAuth 2. Most interactions result in some data being written to the Mongo database. A socket is maintained for each active user.

## Task Server

The task server does most of the heavy lifting. File listing, file transfers, sending emails and deleting certain files are all done through this server. 

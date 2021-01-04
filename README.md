# Serverless Receipt manager application

This application allows you to manage your day to day bills and receipts by uploading its image to cloud.

# Functionality of the application

This application will allows creating/removing/updating/fetching receipts.
Each receipt object can optionally have an attachment image. Each user only has access to receipt items that he/she has created.

# How to run the application

## Backend

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```

## Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```
cd client
npm install
npm run start
```

This should start a development server with the React application that will interact with the serverless receipt manager application.

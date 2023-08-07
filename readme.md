## Table of Contents
1. [General Info](#general-info)
2. [Technologies](#technologies)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Running the Application](#running-the-application)
7. [Test](#test)
8. [API Documentation](#api-documentation)

### General Info
***
TEST TECNICO
API GATEWAY - DEVICE

This project is an API developed to store information about Gateways and the devices associated with each of them.

## Technologies
***
A list of technologies used within the project:
* [MySQL Server](https://dev.mysql.com/downloads/mysql/): Version 8.1.0 
* [Node.js](https://nodejs.org/): Version v16.16.0
* [npm](https://www.npmjs.com/): Version 9.7.2
* [TypeScript](https://www.typescriptlang.org/): Version 5.1.6
* [Express](https://expressjs.com/): Version 4.18.2
* [Express-Validator](https://express-validator.github.io/): Version 7.0.1
* [MySQL Server](https://dev.mysql.com/downloads/mysql/): Version 8.1.0
* [mysql2](https://www.npmjs.com/package/mysql2): Version 3.5.2
* [swagger-jsdoc](https://www.npmjs.com/package/swagger-jsdoc): Version 6.2.8
* [swagger-ui-express](https://www.npmjs.com/package/swagger-ui-express): Version 5.0.0
* [uuid](https://www.npmjs.com/package/uuid): Version 9.0.0
* [dotenv](https://www.npmjs.com/package/dotenv): Version 16.3.1
* [copyfiles](https://www.npmjs.com/package/copyfiles): Version 2.4.1
* [Jest](https://jestjs.io/): Version 29.6.2
* [Supertest](https://www.npmjs.com/package/supertest): Version 6.3.3

### Prerequisites
Before you begin, ensure you have met the following requirements:
* You have installed node.js and npm.
* You have a MySQL Server running.

## Installation
***
To install TEST TECNICO, follow these steps:

Linux and macOS:
```bash
$ git clone https://github.com/jmarqb/Technical_Test_API_Gateways_Device.git
$ cd ../path/to/the/file
$ npm install
```

```
Windows:
$ git clone https://github.com/jmarqb/Technical_Test_API_Gateways_Device.git
$ cd ../path/to/the/file
$ npm install
```

## Configuration
***
Copy .env.example to .env and update it with your MySQL connection parameters.
```
$ cp .env.example .env
```
## Running the Application
***
To run TEST TECNICO, use the following command:

```bash
$ npm run build
$ npm run start
```

This will start the server and the application will be available at http://localhost:<your_port>

Remember to replace <your_port> with the port number you have configured in your .env file.

## Test
***
To ensure everything is working as expected, this project includes several integration tests using Jest. To run these tests, follow these steps:

Make sure you have all the project dependencies installed. If you haven't yet, you can do this with the `npm install` command.
Run the TEST using the next command:

```bash
$ npm test
```

If you want to get a code coverage report to see what parts of your code are not being tested, you can use the command:

```bash
$ npm test -- --coverage
```

This command will generate a code coverage report in the console and will also create a coverage folder at the root of your project with a detailed report.

## API Documentation
***
Our API documentation is available at `localhost:<port>/api-docs/` 
 Example : when you run the server locally. "localhost:3000/api-docs/"

For more detailed information about the endpoints, responses, and status codes, visit the API documentation.

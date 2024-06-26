# NodeJs-test

Test task for junior node js position.

List of tools used:

- PostgreSQL;
- Node.js + (Express.js, Google APIs, PostgreSQL, JWT, Cheerio, Axios, Json2Csv).

## Features

- Scraps the pre-defined web page;
- Exports scrap results into 3 different formats: JSON, CSV, Google Sheet;
- Easily replaceable Google Credentials.

## How to start
- Execute SQL script to create tables for a PostgreSQL DB. There are 3 tables: `users`, `parse_requests`, `expired_tokens`; the last table is for storing JWT tokens that were used on log-out endpoint;
- Create `.env` file in `test-task` folder with template below. Input all neccessary data into the file;
- Create a Google Service Account with JSON type and drop the JSON file in to `test-task` folder. Create a new spreadsheet/use existing one and share it with the email provided by Google Service Account with `editor` scope. More details can be found in this [Guide](https://medium.com/@shkim04/beginner-guide-on-google-sheet-api-for-node-js-4c0b533b071a).
- Run Node.js application and test it with tools like Postman/Insomnia/etc.

`.env` file template:
```sh
DEV_PORT=
JWT_SECRET=

#DB CONFIG
DB_HOST=
DB_USERNAME=
DB_PASSWORD=
DB_DATABASE=
DB_PORT

#GOOGLEAPIS CONFIG
SERVICE_ACCOUNT_KEY_FILE=./credentials.json
SHEET_ID=
```


## How it works

The app contains 5 endpoint. 3 for auth purposes and 2 for scrapping purposes. Each of them have their own request sctructure and these will be shown below.

- /auth/sign-up - registers a new user.
Requires request JSON body with mandatory `email` and `password` properties.\
Example request:\
{\
&emsp;"email": "testmail@mail.com",\
&emsp;"password": "123456"\
}
- /auth/login - logs in a registered user. If not registered an error will be returned. Requires request JSON body with mandatory `email` and `password` properties. If provided data is valid, a JWT will be returned. JWT is mandatory to make the following requests.\
Example request:\
{\
&emsp;"email": "testmail@mail.com",\
&emsp;"password": "123456"\
}\
Example response:\
{\
&emsp;"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."\
}
- /auth/logout - logs out the provided token. Since invalidating JWTs is not a simple task, they are being moved to separate DB table to blacklist them. Requires request JSON body with mandatory `token` property.\
Example body:\
{\
&emsp;"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"\
}
- /parse - parses the pre-defined web page and returns information about people mentioned on the page. Requires `Authorization` header with JWT in it (**NOTE**: do **not** provide prefixes like Bearer), like `Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`. Supports optional Query String `exportType` parameter with 3 possible values: `json`, `csv`, `googlesheet`; defaults to `json`. The parameter defines to which format data will be extracted.\
Example request:\
GET http://localhost:5000/parse?exportType=csv
- /parse-requests - lists all `/parse` requests made with basic info about them. Requires `Authorization` header with JWT in it (**NOTE**: do **not** provide prefixes like Bearer), like `Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`. Does not have any inputs.\
Example request:\
GET http://localhost:5000/parse-requests

## Project structure
All logic has been implemented within 3 files: `app.js`, `authQueries`, `parseQueries`. Also `.env` and `Google Service Account` files are needed for the app to function properly.

## Results examples
#### JSON
![image](https://github.com/capybarin/NodeJs-test/assets/45234376/644e81e4-2939-421f-8c82-3edef7e30389)

#### CSV
![image](https://github.com/capybarin/NodeJs-test/assets/45234376/4b7188b9-9b97-41e2-b221-72eeeea9174b)

#### Google Sheet
![image](https://github.com/capybarin/NodeJs-test/assets/45234376/d31b605a-8909-45da-8d21-0e91f24789f5)


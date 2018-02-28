
## Register of expenses
**Register of Expenses** is a simple REST API server for managing your expenses.

[**Live** (heroku)](https://still-earth-87593.herokuapp.com) - you can send there requests
`Node version: 8.9.4`

## Table of Contents
- [Installation](#installation)
  * [Set Config FIle](#set-confg-file)
  * [Run Server](#run-server)
- [Routes](#routes)
  * [**POST** /expenses](#post-expenses)
    + [Required](#required)
    + [Response](#response)
    + [Possible HTTP Status Codes](#possible-http-status-codes)
  * [**GET** /expenses](#get-expenses)
    + [Required](#required-1)
    + [Response](#response-1)
    + [Possible HTTP Status Codes](#possible-http-status-codes-1)
  * [**GET** /expenses/**:id**](#get-expensesid)
    + [Required](#required-2)
    + [Response](#response-2)
    + [Possible HTTP Status Codes](#possible-http-status-codes-2)
  * [**PATH** /expenses/**:id**](#path-expensesid)
    + [Required](#required-3)
    + [Response](#response-3)
    + [Possible HTTP Status Codes](#possible-http-status-codes-3)
  * [**DELETE** /expenses/**:id**](#delete-expensesid)
    + [Required](#required)
    + [Response](#response-4)
    + [Possible HTTP Status Codes](#possible-http-status-codes-4)
  * [**POST** /users/](#post-users)
    + [Requried](#requried)
    + [Response](#response-5)
    + [Possible HTTP Status Codes](#possible-http-status-codes-5)
  * [**GET** /users/me](#get-usersme)
    + [Required](#required-1)
    + [Response](#response-6)
    + [Possible HTTP Status Codes](#possible-http-status-codes-6)
  * [**POST** /users/login](#post-userslogin)
    + [Required](#required-2)
    + [Response](#response-7)
    + [Possible HTTP Status Codes](#possible-http-status-codes-7)
  * [**POST** /users/logout](#post-userslogout)
    + [Required](#required-3)
    + [Response](#response-8)
    + [Possible HTTP Status Codes](#possible-http-status-codes-8)


## Installation
First, you need to download or copy this repository
Then, you need to download unnecessary files by typing in console `` npm install `` (in the directory when the server is installed)
### Set Config FIle
The next important step is to create your config file with environment variables.
The file should be created in `/server/config/`  folder, called `config.json`.
Inside the file you have to set:
- `MONGOHQ_URL` - url to your mongodb server
- `PORT` - in which port it should work
- `JWT_SECRET` - string of characters which is used to create tokens.
Example:
```JSON
{
	"production": {
	  "MONGOHQ_URL": "mongodb://localhost:27017/database",
	  "PORT": 3000,
	  "JWT_SECRET": "432hsjhdf9123hkjashd9123kjdhfs923sawse1"
	}
}
```
You can also set configuration for `test` or `development`.
### Run Server
Type in console `npm start`.

## Routes
### POST /expenses
Create new expense document
#### Required:
- `x-auth` in header (token)
- in json format body:
	- `title` - title of the expense
	- `amount`- the amount of money
	- `spentAt`- date as time stamp

Example:
```JSON
{
	"title": "Food",
	"amount": 12.5,
	"spentAt": 1519760066378
}
```

#### Response
The created expense document
Example
```JSON
{
    "result": {
        "title": "Food",
        "amount": 12.5,
        "spentAt": 1519760066378,
        "_creator": "5a95b4da5929d31a120f0449",
        "_id": "5a95b3525929d31a120f0448",
        "__v": 0
    }
}
```

#### Possible HTTP Status Codes
`200`, `400`, `401`


###  GET /expenses
Returns all expenses of the user

#### Required:
- `x-auth` in header (token)

#### Response
array of expenses
Example:
```JSON
{
    "result": [
        {
            "_id": "5a95b5215929d31a120f044b",
            "title": "Food",
            "amount": 12.5,
            "spentAt": 1519760066378,
            "_creator": "5a95b4da5929d31a120f0449",
            "__v": 0
        },
        {
            "_id": "5a95b53b5929d31a120f044c",
            "title": "Book",
            "amount": 50,
            "spentAt": 1519760066378,
            "_creator": "5a95b4da5929d31a120f0449",
            "__v": 0
        }
    ]
}
```

#### Possible HTTP Status Codes
`200`, `400`, `401`

### GET /expenses/:id
Get one document expense with the given id.

#### Required:
- `x-auth` in header (token)
- `:id` of expense in the address

Example:
address: `localhost:3000/expenses/5a95b5215929d31a120f044b`

#### Response
The expense document
Example:
```JSON
{
    "result": {
        "_id": "5a95b5215929d31a120f044b",
        "title": "Food",
        "amount": 12.5,
        "spentAt": 1519760066378,
        "_creator": "5a95b4da5929d31a120f0449",
        "__v": 0
    }
}
```
#### Possible HTTP Status Codes
`200`, `400`, `401`, `404`

### PATH /expenses/:id

Edit an expense document with the given id.

#### Required:
- `x-auth` in header (token)
- `:id` of expense in the address

Example:
address: `localhost:3000/expenses/5a95b5215929d31a120f044b`
Body:
```JSON
{
	"title": "Pancakes"
}
```
#### Response
The edited expense
Example:
```JSON
{
    "result": {
        "_id": "5a95b5215929d31a120f044b",
        "title": "Pancakes",
        "amount": 12.5,
        "spentAt": 1519760066378,
        "_creator": "5a95b4da5929d31a120f0449",
        "__v": 0
    }
}
```

#### Possible HTTP Status Codes
`200`, `400`, `401`, `404`

### DELETE /expenses/:id
Delete an expense document with the given id
#### Required
- `x-auth` in header (token)
- `:id` of expense in the address

address: `localhost:3000/expenses/5a95b5215929d31a120f044b`
#### Response
The deleted expense document
Example:
```JSON
{
    "result": {
        "_id": "5a95b5215929d31a120f044b",
        "title": "Pancakes",
        "amount": 12.5,
        "spentAt": 1519760066378,
        "_creator": "5a95b4da5929d31a120f0449",
        "__v": 0
    }
}
```
#### Possible HTTP Status Codes
`200`, `400`, `401`, `404`

### POST /users/
Create  an user
#### Requried
The body
- `email`
- `password`- at least 6 characters

Example:
```JSON
{
	"email": "email@something.com",
	"password": "123abc"
}
```

#### Response
Created user
Example:
```JSON
{
    "result": {
        "_id": "5a95bc265929d31a120f044d",
        "email": "email@something.com"
    }
}
```
Also `x-auth` token in header to authenticate user:
`x-auth:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOi...`

If error occurred, there is send response with error
Example:
```JSON
{
    "code": 11000,
    "errmsg": "E11000 duplicate key error collection: ExpensesRegister.users index: email_1 dup key: { : \"email@something.com\" }"
}
```
#### Possible HTTP Status Codes
`200`, `400`

### GET /users/me
Authenticate user by its token
#### Required
- `x-auth` in header

#### Response
The user
Example:
```JSON
{
    "result": {
        "_id": "5a95bc265929d31a120f044d",
        "email": "email@something.com"
    }
}
```
Also `x-auth` token in header to authenticate user:
`x-auth:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOi...`

#### Possible HTTP Status Codes
`200`, `401`

### POST /users/login
Log in user by its credentials (`email` and `password`)

#### Required
- `email` and `password` in the body

Example:
```JSON
{
	"email": "email@something.com",
	"password": "123abc"
}
```
#### Response
The user
Example:
```JSON
{
    "result": {
        "_id": "5a95bc265929d31a120f044d",
        "email": "email@something.com"
    }
}
```

Also `x-auth` token in header to authenticate user:
`x-auth:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOi...`

#### Possible HTTP Status Codes
`200`, `401`

### POST /users/logout
Log out the user

#### Required
- `x-auth` token in header

#### Response
Nothing,
```JSON
```

#### Possible HTTP Status Codes
`200`, `400`, `401`

# Meetapp - Back-end

This project was built as the final assignment for Rocketseat Bootcamp 5th Edition.
It is a developer event aggregator app called Meetapp (an acronym for Meetup + App).
The whole project consists in three parts: back-end, front-end and mobile.

This is the back-end of the Meetapp.
It's a REST API built using Node.js and ExpressJS Framework.

### Features
* User Authentication
* Password Encryption
* JWT - JSONWebToken
* Data validation
* File upload
* E-mail
* Queue
* Pagination

### Tools
* Sequelize
* Postgres
* MongoDB
* Docker
* Redis
* Nodemon + Sucrase
* ESLint + Prettier + EditorConfig


| Routes      |                                |
|-------------|--------------------------------|
| /users      | POST - Create a new user       |
| /sessions   | POST - Authenticates an user   |


| Auth-only Routes         |                         |
|--------------------------|-------------------------|
| /files                   | POST - File upload      |
| /users                   | PUT  - Update user      |
| /meetups                 | GET  - Show all meetups |
| /meetups/:id             | PUT  - Update meetup    |
| /meetups                 | POST - Create meetup    | 
| /meetups/:id             | DELETE - Delete meetup  |
| /organizing              | GET - Shows all user meetup subscriptions |
| /subscriptions           | POST - Create subscription |
| /meetups/:id/subscribe   | POST - Subscribe to a meetup |
| /meetups/:id/unsubscribe | DELETE - Unsubscribe to a meetup |

## Installation
You need to install Node.js, NPM, Postgres, MongoDB to run this project.
If you don't want to install those databases, you can use docker instead.

### Docker config
If you already installed docker and you're using Linux, just type in terminal command line the following:

```docker run --name meetappdb -e POSTGRES_USER="docker" -e POSTGRES_PASSWORD="docker" -p 5432:5432 -d -t postgres```

## Configuration
You'll need to configure .env variable like the .env.example given in the project's root folder.

## Usage
In your projects folder, open a terminal and type ``` yarn ``` to install all of the project dependencies.
After they finish installing, you'll need to run ```yarn dev``` to run your application. 
Also you'll need to open another terminal tab and run ```yarn queue```.



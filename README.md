# Simple-Blog-API
A simple blog api written in javascript with fastify

## Setup
```bash
$ git clone https://github.com/curtisGilchrist/Simple-Blog-API
$ cd Simple-Blog-API
$ npm init -y
$ npm i fastify
$ npm i @fastify/mysql
$ npm pkg set type=module
```
It will not run without a database to connect to. In a mariadb server, type:
``` SQL
CREATE database blogs;
using database blogs;
CREATE TABLE Post (
    PostID INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    Content TEXT NOT NULL,
    FULLTEXT (Title, Content),
    Category VARCHAR(100) NOT NULL,
    PublicationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE USER 'app_user'@localhost IDENTIFIED BY 'YourDatabasePassword';
GRANT SELECT, INSERT, UPDATE, DELETE ON 'blogs'.* TO 'app_user'@localhost;
```
See [Secrets](#Secrets) to get the password set up

## AutoRun
I made a dinit script to start the server automatically on-boot, under the user fastify, containing the server in `/opt/fastify-app/`

## Nginx
I have made a simple Nginx config to protect the API

## Secrets
We must give the database password to the server, so we encrypt it.
```
# cd /opt/fastify-app/
# mkdir -p .secrets && chmod 700 .secrets
# openssl rand -hex 32 > .secrets/key
# chmod 600 .secrets/key
# chown fastify:fastify .secrets/key
# echo YourDatabasePassword > secret.txt
# openssl enc -aes-256-cbc -pbkdf2 -salt -in secret.txt -out secret.enc -pass file:.secrets/key
# rm secret.txt
```


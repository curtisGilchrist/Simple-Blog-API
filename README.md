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
```SQL
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

## Usage and examples
### Reading
To get a list of blogs
```bash
$ curl -s http://server-ipv4-here:8080/blogs
```
The return schema is a list of jsons containing PostID, Title, and PublicationDate.

To select a singular blog, add a / followed by the blog's ID to the request, for example
```bash
$ curl -s http://server-ipv4-here:8080/blogs/1
```
will ask for the blog with the PostID `1`.
The return schema is a json containing PostID, Content, and PublicationDate. The Title has been merged onto the content.

### Creating
To make a post
```bash
$ curl -s -X POST http://server-ipv4-here:8080/blogs \
-H 'Content-Type: application/json' \
-d '{"title": "Your Blog Title Here", "content":"Your blog content here", "category": "general"}'
```
The return schema of making a post is the full json of the post, containing the id, title, content, and category.

To edit a post that already exists, do a PUT instead, and add the blog's ID so the server knows which blog to change
```bash
$ curl -s -X PUT http://server-ipv4-here:8080/blogs/1 \
-H 'Content-Type: application/json' \
-d '{"title": "Your Edited Blog Title Here", "content":"Your edited blog content here", "category": "general"}'
```
There is no return for editing except for the http code.

### Querying
To make a query
```bash
curl -X QUERY \
-H 'Content-Type: application/json' \
-d '{"q": "your query here"}' \
http://server-ipv4-here:8080/blogs/search
```
The return schema is the same as the return schema for reading a list of blogs

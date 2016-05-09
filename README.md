# QuizGround 
Create and answer quizzes with ease.

http://quiz-ground.herokuapp.com/

## Run

### Server

- Navigate inside **backend** folder
- `npm install`
- `node app.js`

### Client

- Navigate inside **frontend** folder
- `npm install`
- Copy all contents to your web server or use node module *http-server*

## Config

Make sure to insert this client into the database for the frontend app to work, or you can create your own client
and put the credentials info (Basic method encrypted) inside app.js's run section.

`db.clients.update({_id: ObjectId('5648048f62bd961100878525'), name: 'new client', secret: 'very secure'}, {_id: ObjectId('5648048f62bd961100878525'), name: 'new client', secret: 'very secure'}, {upsert: true})`

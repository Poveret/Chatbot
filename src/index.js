const express = require('express');
const request = require('request');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.send(
      '<form action="/dudas" method="post">' +
        '<label for="duda">Escribe tu duda:</label>' +
        '<input type="text" id="duda" name="duda" style="width: 80%;">' +
        '<button type="submit">Enviar</button>' +
      '</form>'
    );
  });

app.post('/dudas', (req, res) => {
  const { duda } = req.body;

  const options = {
  'method': 'POST',
  'url': process.env.URL_AI,
  'headers': {
    'Content-Type': 'application/json',
    'X-API-KEY': process.env.API_KEY
  },
  body: JSON.stringify({
    "model": "gpt-35-turbo-0301",
    "uuid": "1dasdasdasd",
    "message": {
      "role": "user",
      "content": duda
    },
    "temperature": 0,
    "origin": "escueladata",
    "tokens": 3000,
    "folder": "root",
    "user": "franciberja@gmail.com"
  })};

request(options, (error, response) => {
  if (error) throw new Error(error);
  console.log(response.body);
  res.json(JSON.parse(response.body).content)});
});

app.listen(port, () => {
  console.log('Servidor corriendo en http://localhost:${port}');
});
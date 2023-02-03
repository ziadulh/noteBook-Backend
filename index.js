const express = require('express');
const cors = require('cors')
const connectToMongo = require('./db');

connectToMongo();
const app = express()
const port = 5000
app.use(cors())

app.use(express.json());

app.use('/api/auth',require('./routes/auth'));
app.use('/api/note',require('./routes/note'));

app.get('/', (req, res) => {
  res.send('Hello World! this is test!')
})

app.listen(port, () => {
  console.log(`Example app listening on port teta ${port}`)
})
const express = require('express');
const cors = require('cors')
const port = process.env.PORT || 5000;


const app = express();

// middle wares
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Bike hunt service running')
})

app.listen(port, () => {
    console.log(`Bike Hunt service running on ${port}`)
})
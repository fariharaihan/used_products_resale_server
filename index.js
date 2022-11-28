const express = require('express');
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;


const app = express();

// middle wares
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hpvuccm.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const bikeCategoryCollection = client.db('bikeHunt').collection('bikeCategoryCollection')
        const bikeCollection = client.db('bikeHunt').collection('categoryCollection')
        const ordersCollection = client.db('bikeHunt').collection('orders')


        app.get('/bikeCategoryCollection', async (req, res) => {
            const query = {};
            console.log(query)
            const options = await bikeCategoryCollection.find(query).limit(3).toArray();
            res.send(options)
        })

        app.get('/categoryCollection', async (req, res) => {
            const query = {};
            console.log(query)
            const cursor = await bikeCollection.find(query).toArray();
            res.send(cursor)
        })
        app.get('/allbikes/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id)
            const query = { category_id: id }
            const product = await bikeCollection.find(query).toArray();
            res.send(product)
        })


        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const orders = await ordersCollection.find(query).toArray();
            res.send(orders);
        })

        app.post('/orders', async (req, res) => {
            const orders = req.body;
            console.log(orders)
            const result = await ordersCollection.insertOne(orders)
            res.send(result);
        })



    }
    finally {

    }
}
run().catch(console.log)

app.get('/', (req, res) => {
    res.send('Bike hunt service running')
})

app.listen(port, () => {
    console.log(`Bike Hunt service running on ${port}`)
})


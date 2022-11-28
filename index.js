const express = require('express');
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000;


const app = express();

// middle wares
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hpvuccm.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    // console.log('token inside verifyJWT ', req.headers.authorization)
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');

    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            console.log(err)
            return res.status(403).send({ message: 'forbidden status' })
        }
        req.decoded = decoded;
        next();
    })


}

async function run() {
    try {
        const bikeCategoryCollection = client.db('bikeHunt').collection('bikeCategoryCollection')
        const bikeCollection = client.db('bikeHunt').collection('categoryCollection')
        const ordersCollection = client.db('bikeHunt').collection('orders')
        const usersCollection = client.db('bikeHunt').collection('users')


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


        app.get('/orders', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;

            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden status' })
            }

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

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '30d' })
                return res.send({ accessToken: token })
            }
            console.log(user)
            res.status(403).send({ accessToken: '' })
        })

        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users)
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user)
            res.send(result);
        })

        app.put('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const option = { upsert: true }
            const updateDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updateDoc, option)
            res.send(result)
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


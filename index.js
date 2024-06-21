const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nhm74.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



async function run() {
    try {
        await client.connect();
        console.log('connected to database')

        const database = client.db("dreamRiderDB");
        const bikeCollection = database.collection("bikeService");
        const userCollection = database.collection("users");
        const uniqueUserCollection = database.collection("uniqueUser");
        const reviewCollection = database.collection("review");
        // const userCollection = database.collection("user");





        //get bike service
        app.get('/bikes', async (req, res) => {
            const cursor = bikeCollection.find({});
            const bikes = await cursor.toArray();
            res.send(bikes);
        })

        //post a bike service
        app.post('/bikes',async (req,res)=>{
            const product=req.body;
            const result=await bikeCollection.insertOne(product);
            res.json(result);
        })

        //get bike service single api
        app.get('/bikes/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const bike = await bikeCollection.findOne(query)
            res.send(bike);
        })
        // delete bike service from admin 
        app.delete('/bikes/:id',async(req,res)=>{
            const id = req.params.id;
            const query={_id:ObjectId(id)};
            const result=await bikeCollection.deleteOne(query)
            res.json(result)
        })

        //get users

        app.get('/users', async (req, res) => {
            const cursor = userCollection.find({});
            const user = await cursor.toArray();
            res.send(user);
        })

        
        //get single order
        // app.get('/users/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = {_id: ObjectId(id) };
        //     const order = await userCollection.findOne(query)
        //     res.send(order);
        // })



        //update order status
        app.put('/users/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    orderStatus: "shipped"
                },
            };
            const result = await userCollection.updateOne(filter, updateDoc, options)
            console.log('updating user ', updateDoc);
            res.json(result)
        })






        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            console.log(email);
            const query = { userEmail: email };
            const cursor = userCollection.find(query)
            const orders = await cursor.toArray();
            res.json(orders)
        })
        //delete order api
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            console.log('deleting user with id', result
            );
            res.json(result)
        })

        //post user
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user)
            res.json(result)
        })

        //unique user post  
        app.post('/uniqueUser', async (req, res) => {
            const user = req.body;
            const result = await uniqueUserCollection.insertOne(user);
            console.log(result)
            res.json(result)
        })
        //unique user put for google login/signIn
        app.put('/uniqueUser', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const option = { upsert: true };
            const updateDoc = { $set: user };
            const result = await uniqueUserCollection.updateOne(filter, updateDoc, option)
            res.json(result)
        })

        // make admin from user

        app.put('/uniqueUser/admin', async (req, res) => {
            const user = req.body;
            // console.log('admin put', user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await uniqueUserCollection.updateOne(filter, updateDoc);
            res.json(result);

        })

        //get user data
        app.get('/uniqueUser/:email', async (req, res) => {
            const email = req.params.email;
            // console.log(email);
            const query = { email: email };
            const user = await uniqueUserCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });

        })

        //review post api
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review)
            // console.log(result);
            res.json(result);
        })
        //get review api
        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({});
            const review = await cursor.toArray()
            res.send(review);
        })


    }
    finally {
        // await client.close()
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('this is dream rider server ')
    console.log('this is server', port)
})



app.listen(port, () => {
    console.log('running genius server on port', port)
})
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json())


const uri = "mongodb+srv://jobFinder:oGbOTCzUfhVfOfRt@cluster0.yy3zscc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const jobCollection = client.db("jobFinder").collection("jobs")
    const bidCollection = client.db("jobFinder").collection("bids")
    
    app.get("/jobs", async (req, res)=> {
        const result = await jobCollection.find().toArray()
        res.send(result);
    })

    app.get("/jobs/:id", async (req, res)=> {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await jobCollection.findOne(query)
        res.send(result);
    })

    app.post('/bid', async(req, res)=>{
      const bidData = req.body;
      const result = await bidCollection.insertOne(bidData)
      res.send(result)
    })
    app.post('/jobs', async(req, res)=>{
      const jobData = req.body;
      const result = await jobCollection.insertOne(jobData)
      res.send(result)
    })

    app.get('/job/:email', async (req, res) => {
      const email = req.params.email
      const query = { 'buyer.email': email }
      const result = await jobCollection.find(query).toArray()
      res.send(result)
    })

    app.delete('/job/:id', async (req, res) => {
      const id = req.params.id
      const query = {_id : new ObjectId(id) }
      const result = await jobCollection.deleteOne(query)
      res.send(result)
    })

    app.put('/jobs/:id', async (req, res) => {
      const id = req.params.id
      const jobData = req.body
      const query = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const updateDoc = {
        $set: {
          ...jobData,
        },
      }
      const result = await jobCollection.updateOne(query, updateDoc, options)
      res.send(result)
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) =>{
    res.send("Welcome to the job server!")
})
app.listen(port, ()=> {
    console.log(`Server is running on port ${port}`)
})
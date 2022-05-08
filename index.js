const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
require("dotenv").config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 8888;


// middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
  const authHeader= req.headers.authorization;
if(!authHeader){
return res.status(401).send({message: 'Unauthorized access'})
}
const token =authHeader.split(' ')[1];
jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=>{
if(err){
  return res.status(403).send({message: 'Forbidden Access'})
}
console.log('decoded', decoded);
req.decoded=decoded;
next();
})
  // console.log('inside Jwt',authHeader);


}

//Server Connection String
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@inventory-management-p1.mpnfu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
// console.log(uri);
//Funtion for api call
async function run() {
  try {
    await client.connect();
    //database name and colletion
    const itemCollection = client
      .db("inventory-management-p11")
      .collection("products");

//auth
app.post('/login', async(req,res)=>{
const user =req.body;
const accessToken = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
  expiresIn:'1d'
});
res.send({accessToken});
})



    //get item
    app.get("/item", async (req, res) => {
      const query = {};
      const cursor = itemCollection.find(query);
      const items = await cursor.toArray();
      res.send(items);
    });
    // Post item Data
    app.post("/item", async (req, res) => {
      const newUser = req.body;
      console.log("adding new user", newUser);
      const result = await itemCollection.insertOne(newUser);
      res.send(result);
    });

    //Delete a item data
    app.delete("/item/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      console.log(id, query);
      const result = await itemCollection.deleteOne(query);
      res.send(result);
    });

    //Get Item by id
    app.get("/item/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: ObjectId(id) };
      const product = await itemCollection.findOne(query);
      res.send(product);
    });

    //Update item Quantity
    app.put("/item/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const updatedItem = req.body;
      console.log(updatedItem);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          quantity: updatedItem.quantity,
        },
      };
      const result = await itemCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    //Get api data by email 
    app.get("/useritem", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      // console.log(email);
if(email===decodedEmail){
  const query = { email: email };
  const cursor = itemCollection.find(query);
  const useritems = await cursor.toArray();
  res.send(useritems);
}
else{
  res.status(403).send({message : 'forbidden access'})
}

    });

  } finally {
    // await client.close();
  }
}
//Exicute funtion
run().catch(console.dir);
//Server Running ok
app.get("/", (req, res) => {
  res.send("Srever is running......!");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

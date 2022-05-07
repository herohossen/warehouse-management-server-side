const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 8888;

// middleware
app.use(cors());
app.use(express.json());

//Server Connection String
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@inventory-management-p1.mpnfu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
console.log(uri);

async function run() {
  try {
    await client.connect();
    //database name and colletion
    const itemCollection = client
      .db("inventory-management-p11")
      .collection("products");

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

    app.get("/item/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: ObjectId(id) };
      const product = await itemCollection.findOne(query);
      res.send(product);
    });

    app.put("/item/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const updatedProduct = req.body;

      console.log(updatedProduct);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          quantity: updatedProduct.quantity,
        },
      };
      const result = await itemCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

  } finally {
    // await client.close();
  }
}
//run funtion
run().catch(console.dir);
//Server Running ok
app.get("/", (req, res) => {
  res.send("Srever is running......!");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

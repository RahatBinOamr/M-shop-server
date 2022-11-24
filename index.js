const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.USER_URL;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
function run() {
  try {
    const categoryCollection = client.db("usedPhone").collection("category");
    const phonesCollection = client.db("usedPhone").collection("phone");
    app.get("/phones", async (req, res) => {
      const filter = {};
      const result = await phonesCollection.find(filter).toArray();
      console.log(result);
      res.send(result);
    });
    app.get("/phones/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const phonesId = await phonesCollection.findOne(filter);
      console.log(phonesId);
      res.send(phonesId);
    });
    app.get("/phonesCategory", async (req, res) => {
      const filter = {};
      const result = await categoryCollection.find(filter).toArray();
      // console.log(result)
      res.send(result);
    });
    app.get("/phonesCategory/:id", async (req, res) => {
      const id = req.params.id;
      const category_id =req.params.id;
      const query = {category_id:category_id}
      if (id == "06") {
        const filter = {};
        const result = await phonesCollection.find(filter).toArray();
        res.send(result);
      } 
      else{
        const categoryId = await phonesCollection.find(query).toArray()
        console.log(categoryId)
        res.send(categoryId)
      }
    });
  } finally {
  }
}
run();

app.get("/", (req, res) => {
  res.send(`server is running ${port}`);
});
app.listen(port, () => console.log("used mobile server is running on", port));

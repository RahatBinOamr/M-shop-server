const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
var jwt = require('jsonwebtoken');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.USER_URL;
// console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {

  const authHeader = req.headers.authorization;
  if (!authHeader) {
      return res.status(401).send('unauthorized access');
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
      if (err) {
          return res.status(403).send({ message: 'forbidden access' })
      }
      req.decoded = decoded;
      next();
  })

}

function run() {
  try {
    const categoryCollection = client.db("usedPhone").collection("category");
    const phonesCollection = client.db("usedPhone").collection("phone");
    const bookingsCollection = client.db('usedPhone').collection('bookings');
    const usersCollection = client.db('usedPhone').collection('users');
    app.get("/phones", async (req, res) => {
      const filter = {};
      const result = await phonesCollection.find(filter).toArray();
      // console.log(result);
      res.send(result);
    });
    app.get("/phones/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const phonesId = await phonesCollection.findOne(filter);
      // console.log(phonesId);
      res.send(phonesId);
    });
    app.get("/category", async (req, res) => {
      const filter = {};
      const result = await categoryCollection.find(filter).toArray();
      // console.log(result)
      res.send(result);
    });
    app.get("/category/:id", async (req, res) => {
      const id = req.params.id;
      const category_id =req.params.id;
      const query = {category_id:category_id}
      if (id == "06") {
        const filter = {};
        const result = await phonesCollection.find(filter).toArray();
        res.send(result);
        // console.log(result);
      } 
      else{
        const categoryId = await phonesCollection.find(query).toArray()
        // console.log(categoryId)
        res.send(categoryId)
      }
    });

    app.get('/bookings',verifyJWT,  async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;

      if (email !== decodedEmail) {
          return res.status(403).send({ message: 'forbidden access' });
      }

      const query = { email: email };
      const bookings = await bookingsCollection.find(query).toArray();
      // console.log(bookings);
      res.send(bookings);
  })

    /* Booking collection */
    app.post('/bookings', async (req, res) => {
      const booking = req.body;
      // console.log(booking);
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
  })

  app.get('/jwt', async (req, res) => {
    const email = req.query.email;
    const query = { email: email };
    const user = await usersCollection.findOne(query);
    if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN )
        return res.send({ accessToken: token });
    }
    res.status(403).send({ accessToken: '' })
});

    /* User info */
    app.post('/users', async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await usersCollection.insertOne(user);
      res.send(result);
  });
  /* user Collection */
  app.get('/users', async (req, res) => {
    const query = {};
    const users = await usersCollection.find(query).toArray();
    res.send(users);
});
/* handel make admin */
app.put('/users/admin/:id', async (req, res) => {
  const decodedEmail = req.decoded.email;
  const query = { email: decodedEmail };
  const user = await usersCollection.findOne(query);

  if (user?.role !== 'admin') {
      return res.status(403).send({ message: 'forbidden access' })
  }

  const id = req.params.id;
  const filter = { _id: ObjectId(id) }
  const options = { upsert: true };
  const updatedDoc = {
      $set: {
          role: 'admin'
      }
  }
  const result = await usersCollection.updateOne(filter, updatedDoc, options);
  console.log(result)
  res.send(result);
})

  } finally {
  }
}
run();

app.get("/", (req, res) => {
  res.send(`server is running ${port}`);
});
app.listen(port, () => console.log("used mobile server is running on", port));

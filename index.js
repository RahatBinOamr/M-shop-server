const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
var jwt = require('jsonwebtoken');
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
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
    const paymentsCollection = client.db('usedPhone').collection('payments');
    const reportCollection = client.db('usedPhone').collection('report');
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
    /* Add phones */

    app.post("/phoneAdd", async (req, res) => {
      /* const email = req.query.email;
      const decodedEmail = req.decoded.email;

      if (email !== decodedEmail) {
          return res.status(403).send({ message: 'forbidden access' });
      } */
      const filter = req.body;
      console.log(filter)
      const result = await phonesCollection.insertOne(filter);
      res.send(result);
    });

    app.get("/phoneAdd", async (req, res) => {
      const filter = {};
      const cursor = phonesCollection.find(filter).sort({ $natural: -1 });
      const service = await cursor.toArray();
      res.send(service);
    });

    
    app.get("/category", async (req, res) => {
      const filter = {};
      const result = await categoryCollection.find(filter).toArray();
      // console.log(result)
      res.send(result);
    });
    app.post('/report',async(req,res)=>{
      const product= req.body;
      const result = await reportCollection.insertOne(product)
      res.send(result)
    })
    app.get('/report',async(req,res)=>{
      const filter = {};
      const result = await reportCollection.find(filter).toArray();
      res.send(result)
    })
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
/* payment  */
app.get('/bookings/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: ObjectId(id) };
  const booking = await bookingsCollection.findOne(query);
  res.send(booking);
})
/* Payment intent  */

app.post('/create-payment-intent', async (req, res) => {
  const booking = req.body;
  const price = booking.price;
  const amount = price * 100;

  const paymentIntent = await stripe.paymentIntents.create({
      currency: 'usd',
      amount: amount,
      "payment_method_types": [
          "card"
      ]
  });
  res.send({
      clientSecret: paymentIntent.client_secret,
  });
});

app.post('/payments', async (req, res) =>{
  const payment = req.body;
  const result = await paymentsCollection.insertOne(payment);
  const id = payment.bookingId
  const filter = {_id: ObjectId(id)}
  const updatedDoc = {
      $set: {
          paid: true,
          transactionId: payment.transactionId
      }
  }
  const updatedResult = await bookingsCollection.updateOne(filter, updatedDoc)
  res.send(result);
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
/* Beyer */
app.get("/beyer", async (req, res) => {
  const query = {};
  const cursor = usersCollection.find(query);
  const user = await cursor.toArray();
  const result = user.filter((u) => u.type == "Beyer")
  res.send(result);

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
/* delete user */
app.delete('/users',async(req,res)=>{
  const id = req.body._id;
  const filter = {_id: ObjectId(id)};
  const result = await usersCollection.deleteOne(filter)
  res.send(result)
})
/* Check Admin  */
app.get('/users/admin/:email', async (req, res) => {
  const email = req.params.email;
  const query = { email }
  const user = await usersCollection.findOne(query);
  res.send({ isAdmin: user?.role === 'admin' });
})
/* handel make admin */
app.put('/users/admin/:id',verifyJWT, async (req, res) => {
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

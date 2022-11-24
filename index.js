const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())




const uri = process.env.USER_URL;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
function run (){
try{
    const categoryCollection = client.db('usedPhone').collection('category')

    app.get("/CoursesCategory",async(req,res)=>{
        const filter = {}
        const result = await  categoryCollection.find(filter).toArray()
        console.log(result)
        res.send(result)
      })




}
finally{

}
}
run()

app.get('/',(req,res)=>{
    res.send(`server is running ${port}`)
})
app.listen(port,()=>console.log("used mobile server is running on",port))
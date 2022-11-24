const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())


app.get('/',(req,res)=>{
    res.send(`server is running ${port}`)
})
app.listen(port,()=>console.log("used mobile server is running on",port))
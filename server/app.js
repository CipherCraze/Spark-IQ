const express = require('express');
const cors = require('cors');
const router=require('./routes/userRouter.js');
const app=express();

app.use(cors());
app.use(express.json());
app.use("/api/v1/Users",router);


module.exports = app;
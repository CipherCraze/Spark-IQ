const express = require('express');

const router=express.Router();
router.post('/check',(req,res)=>{
    console.log("Hello from userRouter");
    return res.status(200).json("Hello from userRouter");
});
module.exports=router;
const express=require('express');
const router=express.Router();
const turf=require('./../models/turf.js')

router.get('/',async(req,res)=>{
    try{
        const data= await turf.find();
        console.log('data showed');
        res.status(200).json(data);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"internal server error"})
    }
})

router.post('/',async(req,res)=>{
    try{
        const data=req.body;
        const newturf = new turf(data);
        const response=await newturf.save();
        console.log('data saved');
        res.status(200).json(response)
    }catch(err){
        console.log(err);
        res.status(500).json({error:"internal server error"})
    }
})

router.put('/:turfid',async(req,res)=>{
    try{
        const turfid=req.params.turfid;
        const turfupdate=req.body;
        const response=await turf.findByIdAndUpdate(turfid,turfupdate,{
            new: true,
            runValidator:true
        })
        if(!response){
            res.status(404).json({error:"record not found"})
        }
        console.log("turf updated")
        res.status(200).json(response)
    }catch(err){
        console.log(err)
        res.status(500).json({error:"internal server error"})

    }
})
module.exports=router;

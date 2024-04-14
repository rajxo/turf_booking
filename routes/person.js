const Express = require('express');
const router = Express.Router();
const person = require('./../models/person');

router.post('/',async(req,res)=>{
    try{
    const data=req.body;
    //create a new person document using mongoose model
    const newperson=new person(data);
    const response=await newperson.save();
    console.log('data saved');
    res.status(200).json(response)
    //or do this
    // newperson.name=data.name;
    // newperson.age=data.age;
    // newperson.work=data.work;
    // newperson.mobile=data.mobile;
    // newperson.email=data.email;
    // newperson.preAmount=data.perAmount;
    // newperson.address=data.address;
    }
    catch(err){
        console.log(err)
        res.status(500).json({error:'internal server error'})
    }
})
router.get('/',async (req,res)=>{
    try{
        const data=await person.find()
        console.log('data showed')
        res.status(200).json(data)
    }catch(err){
        console.log(err);
        res.status(500).json({error:'internal server error'})
    }
})

router.put('/:personid',async(req,res)=>{
    
    try{
        const personid=req.params.personid;
        const personupdate=req.body;

        const response=await person.findByIdAndUpdate(personid,personupdate,{
            new : true, //returns updated value
            runValidator:true //does mongoonse validation
        })

        if(!response){
            res.status(404).json({message:"no such record found"})
        }
        console.log("data updated");
        res.status(200).json(response);

    }catch(err){

        console.log(err);
        res.status(500).json({error:"internal server error"})
    }
})

router.delete('/:personid',async(req,res)=>{
    try{
        const personid=req.params.personid;
        
        const response=await person.findByIdAndDelete(personid);
        if(!response){
            res.status(404).json({error:"no record found"})
        }
        console.log("person deleted");
        res.status(200).json(response)
    }catch(err){
        console.log(err);
        res.status(500).json({error:"internal server error"})
    }
})
module.exports=router;
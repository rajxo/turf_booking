const mongoose=require('mongoose')

const personSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    work:[{
        type:String,
        enum:['football','cricket','event'],
        required:true
    }],
    mobile:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    preAmount:{
        type:Number,
        required:true
    }
})

const person=mongoose.model('person',personSchema)
module.exports=person;
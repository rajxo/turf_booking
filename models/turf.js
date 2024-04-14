const mongoose=require('mongoose');
const { modelName } = require('./person');

const turfschema= new mongoose.Schema({
    turfName:{
        type:String,
        required:true,
        unique:true
    },
    ownerName:{
        type:String,
        required:true,
    },
    turfLength:{
        type:String,
        required:true
    },
    turfWidth:{
        type:String,
        required:true
    },
    turfheigth:{
        type:String,
        required:false
    },
    mobile:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    address:{
        type:String,
        required:true
    },
    work:[{
        type:String,
        enum:['football','cricket','events','hockey','swimming','others'],
        required:true
    }]
})

const turf=mongoose.model('turf',turfschema);
module.exports=turf;

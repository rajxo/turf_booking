const mongoose=require('mongoose')
require('dotenv').config()
//const mongoUrl='mongodb://localhost:27017/flipkart'
const mongoUrl=process.env.mongoUrl //mongodb url from .env 

mongoose.connect(mongoUrl,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
const db=mongoose.connection;

db.on('connected',()=>{
    console.log('connected to mongodb server')
})

db.on('error',(err)=>{
    console.error('mongodb connection error : ',err)
})
db.on('disconnected',()=>{
    console.log('mongobd server disconnected')
})
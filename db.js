const mongoose=require('mongoose')

const mongoUrl='mongodb://localhost:27017/flipkart'

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
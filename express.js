const express=require('express')
const app=express();
const db=require('./db')
const person=require('./models/person')
const turf=require('./models/turf')
const bodyParser=require('body-parser')
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

//person router
const personRouter=require('./routes/person')
//turf router
const turfRouter=require('./routes/turfroute')

//to use routers
app.use('/person',personRouter);
app.use('/turf',turfRouter);

app.get('/',function(req,res){
    res.send('hello welcome to turf booking portal');
})


app.listen(3000)
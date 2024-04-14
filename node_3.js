var os=require('os');
var fs=require('fs');
var notes=require('./notes')

var user=os.userInfo();
let ages=notes.age;
let addnum=notes.addnum;

console.log(user.username)
console.log(user)
console.log(ages)
console.log(addnum(2,3))

fs.appendFile('user.txt','userer name'+user.username+'\n',()=>{
    console.log('name appended')
})
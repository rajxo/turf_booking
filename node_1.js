var prompt=require('prompt-sync')();
//code to take input in js node

//problem 1 movie theater discount application

/*let age = prompt('enter your age');
if(age<=18){
    console.log('your get 20% discount ')
}else if(age>18 && age<65){
    console.log('you get normal ticket price ')
}else{
    console.log('you get 30% senior discount')
}  

// problem 2 rectangle area

let length=prompt('enter length of rectangle');
let height=prompt('enter the  height of rectangle');
let area=length*height;
console.log(area);

// problem 3 create project object

let products=[
    {
        name:'laptop',
        price:30000,
        instock:true
    },
    {
        name:'shirt',
        price:1000,
        instock:false
    },
    {
        name:'tv',
        price:70000,
        instock:true
    }
]

console.log(products[1].instock);

//problem 4 guest checker*/

let guests=['ambani','adani','tata','mark','bill gates','elone musk'];
let search=prompt('enter guest name')
let count=0;

for(guest of guests){
    if(search==guest){
        count++;
        
    }
}
if(count>0){
    console.log('welcome mr.'+search)
}else{
    console.log('sorry, you are not on guest list')
}

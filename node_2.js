const starwars=async ()=>{
    const name=await fetch("https://swapi.dev/api/people/1/");
    const data=await name.json();
    console.log(data);
}
starwars()
const p=document.querySelector('p')
p.innerText=data;
function openDateIdeas(){

const t = translations[lang]

document.getElementById("app").innerHTML = `

<h2>${t.dateIdeas}</h2>

<button onclick="startDateMode('home')">${t.dateHome}</button>

<button onclick="startDateMode('walk')">${t.dateWalk}</button>

<button onclick="startDateMode('culture')">${t.dateCulture}</button>

<button onclick="startDateMode('extreme')">${t.dateExtreme}</button>

<button onclick="startDateMode('romantic')">${t.dateRomantic}</button>

<button onclick="openCouple()">⬅ ${t.back}</button>

`

}


let dateMode = ""


function startDateMode(mode){

dateMode = mode

showDateIdea()

}


function showDateIdea(){

let list

if(dateMode==="home") list = ideas.home[lang] || ideas.home.en
if(dateMode==="walk") list = ideas.walk[lang] || ideas.walk.en
if(dateMode==="culture") list = ideas.culture[lang] || ideas.culture.en
if(dateMode==="extreme") list = ideas.extreme[lang] || ideas.extreme.en
if(dateMode==="romantic") list = ideas.romantic[lang] || ideas.romantic.en

const idea = list[Math.floor(Math.random()*list.length)]

const t = translations[lang]

document.getElementById("app").innerHTML=`

<h2>${t.dateIdeas}</h2>

<p style="font-size:22px">${idea}</p>

<button onclick="showDateIdea()">${t.nextIdea}</button>

<button onclick="openDateIdeas()">⬅ ${t.back}</button>

`

}

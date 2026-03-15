let shuffledIdeas = []
let ideaIndex = 0

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

const list = ideas[mode][lang] || ideas[mode].en

shuffledIdeas = [...list].sort(() => Math.random() - 0.5)

ideaIndex = 0

showDateIdea()

}


function showDateIdea(){

if(ideaIndex >= shuffledIdeas.length){

// когда карточки закончились — перемешиваем заново
shuffledIdeas = [...shuffledIdeas].sort(() => Math.random() - 0.5)
ideaIndex = 0

}

const idea = shuffledIdeas[ideaIndex]

ideaIndex++

const t = translations[lang]

document.getElementById("app").innerHTML = `

<h2>${t.dateIdeas}</h2>

<p style="font-size:22px">${idea}</p>

<button onclick="showDateIdea()">${t.nextIdea}</button>

<button onclick="openDateIdeas()">⬅ ${t.back}</button>

`

}

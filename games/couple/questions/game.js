function startCoupleQuestions(){

const list = coupleQuestions[lang] || coupleQuestions.en
const card = list[Math.floor(Math.random()*list.length)]

showCoupleQuestion(card)

}

function showCoupleQuestion(text){

const t = translations[lang]

document.getElementById("app").innerHTML = `

<h2>${text}</h2>

<button onclick="startCoupleQuestions()">${t.next}</button>

<button onclick="openCouple()">${t.back}</button>

`

}

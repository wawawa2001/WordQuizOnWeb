function loadCSV(event) {
    const input = event.target;
    if ("files" in input && input.files.length > 0) {
        readFileContent(input.files[0]).then(content => {
            const data = parseCSV(content);
            startQuiz()
        }).catch(error => console.log(error));
    }
}

function readFileContent(file) {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onload = event => resolve(event.target.result);
        reader.onerror = error => reject(error);
        reader.readAsText(file);
    });
}

function playCorrectSound() {
    const correctSound = document.getElementById('correctSound');
    correctSound.currentTime = 0;
    correctSound.play();
}

function playInCorrectSound() {
    const correctSound = document.getElementById('incorrectSound');
    correctSound.currentTime = 0;
    correctSound.play();
}

const contentPath = "/storage/emulated/0/Android/data/com.example.wordquizapp/data/"
var engList = [] // 英語の単語を格納するリスト
var jpnList = []
var sortQuiz = []
var quizNum = 0
var startNum = 0
var endNum = 1
var quiz = []
var baseFirstList = []
var baseSecondList = []
var Qlist = []
var correctSound = 0
var incorrectSound = 0
var wrongList = []
var idxNums = []

function parseCSV(text) {
    const lines = text.split(/\r\n|\n/);
    const result = [];
    lines.forEach(line => {
        const values = line.split(",")
        engList.push(values[0]);
        jpnList.push(values[1]);
    });

    baseFirstList = [...engList]
    baseSecondList = [...jpnList]

    startNum = 0
    endNum = engList.length - 1

    return result;
}

function swapList() {
    var tmp = [...baseFirstList];
    baseFirstList = [...baseSecondList]
    baseSecondList = [...tmp]

    var q1 = [...Qlist[0]]
    var q2 = [...Qlist[1]]

    tmp = [...q1]
    q1 = [...q2]
    q2 = [...tmp]

    Qlist = []

    Qlist.push(q1)
    Qlist.push(q2)

}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array
}

function printQuiz(Qlist) {
    document.getElementById("quizText").innerText = (quizNum + 1).toString() + ". " + Qlist[0][0]

    quiz = [...Qlist[1]]
    const rndNums = shuffleArray([0, 1, 2]).slice(0, 3);
    sortQuiz = [
        Qlist[1][rndNums[0]],
        Qlist[1][rndNums[1]],
        Qlist[1][rndNums[2]]
    ]

    document.getElementById("a1").innerText = Qlist[1][rndNums[0]]
    document.getElementById("a2").innerText = Qlist[1][rndNums[1]]
    document.getElementById("a3").innerText = Qlist[1][rndNums[2]]
}

function createRange(size) {
    const range = [];

    for (let i = 0; i < size; i++) {
        range.push(i);
    }

    return range;
}


function pickTrueWord(index){
    var tmpFst = [...baseFirstList]
    tmpFst.splice(index, 1)
    var tmpScd = [...baseSecondList]
    tmpScd.splice(index, 1)

    const rndNums = shuffleArray(createRange(tmpFst.length)).slice(0, 3);
    var f_idx1 = rndNums[0]
    var f_idx2 = rndNums[1]

    Qlist = [
        [baseFirstList.slice(startNum, endNum+1)[index], tmpFst[f_idx1], tmpFst[f_idx2]],
        [baseSecondList.slice(startNum, endNum+1)[index], tmpScd[f_idx1], tmpScd[f_idx2]]
    ]

    return Qlist
}

function nextQuiz(rndNums) {
    if (quizNum + 1 < (endNum - startNum)+1) {
        quizNum++
    } else {
        var alertMSG = ""
        if(wrongList.length > 0){
            alertMSG = alertMSG + "\nMistake Word...\n" + wrongList.join("\n");
            alert(alertMSG)
            downloadCSV(wrongList)
        }

        wrongList = []
        quizNum = 0
    }

    printQuiz(pickTrueWord(rndNums[quizNum]))
}

function judge(num){
    if (quiz[0] == sortQuiz[num]) {
        return true
    } else {
        wrongList.push([Qlist[0][0],quiz[0]])
        return false
    }
}

function skip(){
    wrongList.push([Qlist[0][0], quiz[0]])
}

function buttonClick(num){
    if(judge(num)){
        console.log("Correct!")
        playCorrectSound()
    }else{
        console.log("Incorrect...")
        playInCorrectSound()
    }
    nextQuiz(idxNums)
}

function initialize(){
    idxNums = createRange(engList.length)

    printQuiz(pickTrueWord(idxNums[quizNum]))
}

function skipbtnClick(){
    skip()
    nextQuiz(idxNums)
}

function setFilter() {
    var sNum = parseInt(document.getElementById("sNum").value.toString())
    var eNum = parseInt(document.getElementById("eNum").value.toString())

    if (sNum !== null && sNum !== undefined && sNum !== '' && eNum !== null && eNum !== undefined && eNum !== '') {
        if (parseInt(sNum.toString()) < parseInt(eNum.toString())) {
            startNum = parseInt(sNum.toString()) -1
            endNum = parseInt(eNum.toString()) -1
        }else{
            startNum = 0
            endNum = startNum + 1
        }
    } else {
        startNum = 0
        if (engList.length - 1 < 1) {
            endNum = 1
        } else {
            endNum = engList.length - 1
        }
    }

    engList = [...baseFirstList.slice(startNum, endNum+1)]
    jpnList = [...baseSecondList.slice(startNum, endNum+1)]

    quizNum = 0

    rndNums = shuffleArray(createRange(engList.length)).slice(0, endNum+1)
    printQuiz(pickTrueWord(idxNums[quizNum]))
}

function changebtn(){
    swapList()
    printQuiz(pickTrueWord(idxNums[quizNum]))
}

function startQuiz(){
    initialize()
}

function arrayToCSV(array) {
    const csvRows = array.map(row => row.join(','));
    return csvRows.join('\n');
}

function downloadCSV(array) {
    const csvString = arrayToCSV(array);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = sNum.value + "_" + eNum.value + '_wrong.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
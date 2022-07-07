let fs = require('fs')
let path = require("path")

let songs = {}

function save() {
    fs.writeFileSync("./data/config.json", JSON.stringify(songs, null, "\t"), "utf-8")
}

function stopAll() {
    let sources = document.querySelectorAll("audio")
    for (let i = 0; i < sources.length; i++) {
        sources[i].pause()
        sources[i].currentTime = 0
    }
}

function loadSongs() {
    let files = fs.readdirSync("./data")
    for (let i in files) {
        if (files[i].match(/.(wav|mp3|ogg)$/)) {
            songs[files[i]] = {}
        }
    }
    if (fs.existsSync("./data/config.json")) {
        let config = require(path.resolve("./data/config.json"))
        for (let i in config) {
            if (songs[i]) {
                songs[i].start = config[i].start
                songs[i].end = config[i].end
            }
        }
    }
    generateRows()
}

function generateRows() {
    for (let i in songs) {
        let newElementText = `<tr>
            <td>${i}</td>
            <td><button class="startSong">Start song looping</button><td>
            <td><button class="endSong">Let song end</button></td>
            <td><label>Loop start (seconds): <input type="number" class="loopStart" ${songs[i].start ? 'value="' + songs[i].start + '"' : ""}></label></td>
            <td><label>Loop end (seconds): <input type="number" class="loopEnd" ${songs[i].end ? 'value="' + songs[i].end + '"' : ""}></label></td>
            <td><audio controls><source src="${path.resolve("./data/" + i)}" type="audio/${i.match(/.(wav|mp3|ogg)$/)[1]}"></audio></td>
        </tr>`

        //https://grrr.tech/posts/create-dom-node-from-html-string/
        let placeholder = document.createElement("table")
        placeholder.innerHTML = newElementText
        let newElement = placeholder.firstElementChild

        console.log(newElement)

        newElement.querySelector(".loopStart").onchange = ((key, event) => {
            songs[key].start = event.target.value
        }).bind(null, i)
        newElement.querySelector(".loopEnd").onchange = ((key, event) => {
            songs[key].end = event.target.value
        }).bind(null, i)
        newElement.querySelector(".startSong").onclick = startSongLoop.bind(null, i)
        newElement.querySelector(".endSong").onclick = letSongEnd.bind(null, i)

        document.getElementById("songItems").append(newElement)
        songs[i].element = newElement
    }
}

function startSongLoop(key) {
    songs[key].looping = true
    songs[key].element.querySelector("audio").currentTime = 0
    songs[key].element.querySelector("audio").play()
}

function letSongEnd(key) {
    songs[key].looping = false
}

function loopSongs() {
    for (let i in songs) {
        if (songs[i].looping && songs[i].start && songs[i].end) {
            if (songs[i].element.querySelector("audio").currentTime >= songs[i].end) {
                songs[i].element.querySelector("audio").currentTime -= songs[i].end - songs[i].start
            }
        }
    }
}

loadSongs()
setInterval(loopSongs, 1)
document.getElementById("saveButton").onclick = () => {save()}
document.getElementById("stopButton").onclick = () => {stopAll()}
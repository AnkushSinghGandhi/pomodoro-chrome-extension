chrome.alarms.create({delayInMinutes: 1/60, periodInMinutes: 1/60});
chrome.storage.sync.set({"minutes": 25, "seconds": 60, "pause": true, "countDownTimer": "25:00", "pbutton": "pomodoroBtn"},function(){
    if(!chrome.runtime.error){
        console.log("Initialized");
    }
})

let minutes
let seconds
let pause
let array = ["minutes","seconds","pause","countdownTimer","pbutton"];

chrome.alarms.onAlarm.addListener(() => countdownBG());

function countdownBG() {

    chrome.storage.sync.get(array,function(value){
        if(!chrome.runtime.error){
            console.log(value);

            if(value.minutes)
                minutes = value.minutes;
            else
                minutes = 25;

            if(value.seconds)
                seconds = value.seconds;
            else
                seconds = 60;

            pause = (value.pause !== undefined) ? value.pause : true;
            countdownCalc();
        }
    });
}

// background countdown function
function countdownCalc() {
    // return if countdown is paused
    if(pause) return

    // set minutes and seconds
    let currentMins = minutes - 1
    seconds--
    let currentTimer = (currentMins < 10 ? "0" : "") + currentMins.toString() + ':' + (seconds < 10 ? "0" : "") + String(seconds)

    chrome.storage.sync.set({"seconds":seconds,"countdownTimer":currentTimer},function(){
        if(!chrome.runtime.error){
            console.log("started");
        }
    })
    // count down every second, when a minute is up, countdown one minute
    // when time reaches 0:00, reset
    if(seconds > 0) {
        return;
    } else if(currentMins > 0){
        seconds = 60
        minutes--
        chrome.storage.sync.set({"seconds":seconds,"minutes":minutes},function(){
            if(!chrome.runtime.error){
                console.log("started");
            }
        })
    } else if(currentMins === 0) {
        chrome.storage.sync.set({"pause": true},function(){
            if(!chrome.runtime.error){
                console.log("paused");
            }
        })
    }
}
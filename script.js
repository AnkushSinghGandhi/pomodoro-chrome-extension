import { $, $$ } from './modules/dom.js'
import {
    POMODORO_MODE,
    POMODORO_STATES,
    SIXTY_SECONDS,
    STORAGE_OPTIONS,
    addZero,
    logging
} from './modules/utils.js'

const pomodoroBtns = $$('.button')
const pomodoroBtn = $('#pomodoro-btn')
const shortBreakBtn = $('#short-break-btn')
const longBreakBtn = $('#long-break-btn')
const startBtn = $('#start-btn')
const resetBtn = $('#reset-btn')
const countdownTimer = $('#countdown')
const addTaskBtn = $('#add-task-btn')
const addTaskForm = $('#task-form')
const cancelBtn = $('#cancel')
const taskNameInput = $('#text')
const pomodoroInput = $('#est-pomodoro')
const saveBtn = $('#save')
const tasksList = $('#tasks')
const template = $('#list-item-template')
const selectedTask = $('#selected-task')
const audio = $('#audio')

let tasks = []
let minutes 
let seconds 
let pause 
let pomodoro = "pomodoro"
let pomodorosCompleted = 0
let selectedTaskElement

// Storage the current minutes and countdownTimer by MODE
const setStorageTimer = (mode) => {
    countdownTimer.innerHTML = mode.countdownTimer
    pomodoro = mode.description
    minutes = mode.minutes
    chrome.storage.sync.set({ "minutes": minutes, "countdownTimer": mode.countdownTimer }, () => logging("added target pomodoro"))
}

//Sorage the current state of the `pause`
const setStoragePause = () => {
    startBtn.innerHTML = pause ? POMODORO_STATES.pause : POMODORO_STATES.start
    pause = !pause
    if (!pause) {
        // call count down timer
        countdown()
    }
    // storage new value of `pause`
    chrome.storage.sync.set({ "pause": pause }, () => logging(pause ? "started" : "paused"))
}

// Prepared de current mode for display
const setDisplayMode = (mode) => {
    pomodoro = mode.description
    countdownTimer.innerHTML = mode.countdownTimer
    minutes = mode.minutes
}

// get the current minutes from storage
const setMinutesByStorage = (value) => {
    minutes = value.minutes ??= POMODORO_MODE.work.minutes
}

// get the current seconds from storage
const setSecondsByStorage = (value) => {
    seconds = value.seconds ??= SIXTY_SECONDS
}

// get the current display countdown timer from storage
const setCountdownByStorage = (value) => {
    countdownTimer.innerHTML = value.countdownTimer ??= POMODORO_MODE.work.countdownTimer
}

// set the current state of the pomodoro button
const setPomodoroStateByStorage = (value) => {
    const isPaused = value.pause
    const isWorkMode = value.countdownTimer == POMODORO_MODE.work.countdownTimer
    
    if (isPaused && !isWorkMode) {
        pause = value.pause;
        startBtn.innerHTML = POMODORO_STATES.start
    } else if (!isPaused && !isWorkMode) {
        pause = value.pause;
        startBtn.innerHTML = POMODORO_STATES.pause
        countdown()
    } else {
        pause = true
    }
}

const setClassPomodoroBtnByStorage = (value) => {
    if (value.pbutton) {
        if (value.pbutton == "shortBreakBtn") {
            shortBreakBtn.classList.add('selected');
        }
        else if (value.pbutton == "longBreakBtn") {
            longBreakBtn.classList.add('selected');
        }
        else {
            pomodoroBtn.classList.add('selected');
        }
    }
    else
        pomodoroBtn.classList.add('selected');
}

chrome.storage.sync.get(STORAGE_OPTIONS, (value) => {
    if(!chrome.runtime.error){
        console.log(value);

        setMinutesByStorage(value)
        setSecondsByStorage(value)
        setCountdownByStorage(value)
        setPomodoroStateByStorage(value)
        setClassPomodoroBtnByStorage(value)
    }
});

// event listener for pomodoro buttons
document.addEventListener('click', e => {
    if(!e.target.matches('.button')) return

    // reset when pomodoro button selected
    pause = true
    seconds = SIXTY_SECONDS
    startBtn.innerHTML = POMODORO_STATES.start

    chrome.storage.sync.set({ "pause": pause, "seconds": seconds }, () => logging("added target pomodoro"))

    // only selected button has selected class
    pomodoroBtns.forEach(button => button.classList.remove('selected'))

    e.target.classList.add('selected')

    let pbutton

    if (e.target.classList == shortBreakBtn.classList){
        pbutton = "shortBreakBtn"
    }
    else if (e.target.classList == longBreakBtn.classList){
        pbutton = "longBreakBtn"
    }
    else {
        pbutton = "pomodoroBtn"
    }

    chrome.storage.sync.set({ "pbutton": pbutton }, () => logging("added target pomodoro"))

    // set timer
    if(e.target.matches('#pomodoro-btn')) {
        setStorageTimer(POMODORO_MODE.work)
    } else if(e.target.matches('#short-break-btn')) {
        setStorageTimer(POMODORO_MODE.shortBreak)
    } else if(e.target.matches('#long-break-btn')) {
        setStorageTimer(POMODORO_MODE.longBreak)
    }
})

// event listener for start button
startBtn.addEventListener('click', () => setStoragePause())

// event listener for reset button
resetBtn.addEventListener('click', () => {
    startBtn.innerHTML = POMODORO_STATES.start
    setStorageTimer(POMODORO_MODE.work)
    
    pause = true
    seconds = SIXTY_SECONDS

    const dict = {
        minutes,
        pause,
        seconds,
        "countdownTimer": POMODORO_MODE.work.countdownTimer
    }

    chrome.storage.sync.set(dict, () => logging("paused"))

})

// show/hide task form
addTaskBtn.addEventListener('click', () => {
    addTaskForm.classList.toggle('hide')
})

// cancel task and close task form
cancelBtn.addEventListener('click', () => {
    taskNameInput.value = ""
    pomodoroInput.value = ""
    addTaskForm.classList.add('hide')
})

// save task and add to the task object to the array and list
saveBtn.addEventListener('click', e => {
    e.preventDefault()

    // get the inputs
    const taskName = taskNameInput.value
    const pomodoros = pomodoroInput.value

    // don't add task if a form element is blank or estimated pomodoros is <=0
    if (taskName === "" || pomodoros === "" || pomodoros <= 0) return

    // create new object
    const newTask = {
        name: taskName,
        completedPomodoros: 0,
        totalPomodoros: pomodoros,
        complete: false,
        id: new Date().valueOf().toString()
    }
    // add task to array
    tasks.push(newTask)
    // render task
    addTask(newTask)

    // clear inputs
    taskNameInput.value = ""
    pomodoroInput.value = ""
})

// event listener for the list item, checkbox and delete button
document.addEventListener('click', e => {
    // if a delete button is selected
    if(e.target.matches('.delete-btn')) {
        // find the list item associaited with the delete button and remove it
        const listItem = e.target.closest('.list-item')
        listItem.remove()

        // find the id of the task to remove the task object from the array  
        const taskId = listItem.dataset.taskId
        tasks = tasks.filter(task => task.id !== taskId )

        // remove title when selected task is deleted
        if (listItem === selectedTaskElement) {
            selectedTask.innerHTML = ""
        }
    }
    // if a list item is selected
    if(e.target.matches('.list-item')) {
        // set the task as the selected element and put title in selected-task div
        selectedTaskElement = e.target
        const taskName = e.target.querySelector('.task-name')
        const text = taskName.innerHTML
        selectedTask.innerHTML = text
    }

    // if a checkbox is selected
    if(e.target.matches('input[type=checkbox]')) {
        // ge the list item and the id of the item
        const listItem = e.target.closest('.list-item')
        const taskId = listItem.dataset.taskId
        // find the task object in the array
        const checkedTask = tasks.find(task => task.id === taskId)
        // if set to true, change to false, and if set to false, set to true
        if(checkedTask.complete) checkedTask.complete = false
        else if(!checkedTask.complete)checkedTask.complete = true
    }
})

// add task as list item
function addTask(task) {
    const templateClone = template.content.cloneNode(true)
    const listItem = $('.list-item', templateClone)
    listItem.dataset.taskId = task.id
    const checkbox = $('input[type=checkbox]', templateClone)
    checkbox.checked = task.complete
    const taskName = $('.task-name', templateClone)
    taskName.innerHTML = task.name
    const pomodoroCount = $('.pomodoro-count', templateClone)
    pomodoroCount.innerHTML = task.completedPomodoros.toString() + '/' + task.totalPomodoros
    tasksList.appendChild(templateClone)
}

// countdown function
function countdown() {
    // return if countdown is paused
    if(pause) return

    // set minutes and seconds
    const currentMins = minutes - 1
    seconds--
    const currentTimer = addZero(currentMins) + currentMins.toString() + ':' + addZero(seconds) + String(seconds)
    countdownTimer.innerHTML = currentTimer

    chrome.storage.sync.set({ "seconds": seconds, "countdownTimer": currentTimer }, () => logging("started"))

    // count down every second, when a minute is up, countdown one minute
    // when time reaches 0:00, reset
    if(seconds > 0) {
        setTimeout(countdown, 1000);
    } else if(currentMins > 0){
        seconds = SIXTY_SECONDS
        minutes--

        chrome.storage.sync.set({ "seconds": seconds, "minutes": minutes }, () => logging("started"))
        
        countdown();
    } else if(currentMins === 0) {
        audio.play()
        reset()        
    }
}

// reset function when countdown ends
function reset() {
    // set to start the next round    
    startBtn.innerHTML = POMODORO_STATES.start
    pause = true

    pomodoroBtns.forEach(button => {
        button.classList.remove('selected')
    })

    // if current round is a break, set for pomodoro
    if (pomodoro === POMODORO_MODE.shortBreak.description || pomodoro === POMODORO_MODE.longBreak.description) {
        setDisplayMode(POMODORO_MODE.work)
        pomodoroBtn.classList.add('selected')
        return
    }

    // if current round is a pomodoro, set for break
    // if less than four pomodoros have been completed, go to short break
    // if four pomodoros have been completed, go to long break
    if (pomodoro === POMODORO_MODE.work.description && pomodorosCompleted < 4) {
        pomodorosCompleted++
        setDisplayMode(POMODORO_MODE.shortBreak)
        shortBreakBtn.classList.add('selected')
    } else if (pomodoro === POMODORO_MODE.work.description && pomodorosCompleted === 4) {
        pomodorosCompleted = 0
        setDisplayMode(POMODORO_MODE.longBreak)
        longBreakBtn.classList.add('selected')
    }

    // if a task has been selected
    if (selectedTaskElement != null) {
        const selectedTaskId = selectedTaskElement.dataset.taskId
        const current = tasks.find(task => task.id === selectedTaskId)
        current.completedPomodoros++
        const pomodoroCount = $('.pomodoro-count', selectedTaskElement)
        pomodoroCount.innerHTML = current.completedPomodoros.toString() + '/' + current.totalPomodoros 
    }

    // TODO add option to start next round automatically
}
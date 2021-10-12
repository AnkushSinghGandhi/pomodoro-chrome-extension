const pomodoroBtns = document.querySelectorAll('.button')
const pomodoroBtn = document.getElementById('pomodoro-btn')
const shortBreakBtn = document.getElementById('short-break-btn')
const longBreakBtn = document.getElementById('long-break-btn')
const startBtn = document.getElementById('start-btn')
const countdownTimer = document.getElementById('countdown')
const addTaskBtn = document.getElementById('add-task-btn')
const addTaskForm = document.getElementById('task-form')
const cancelBtn = document.getElementById('cancel')
const taskNameInput = document.getElementById('text')
const pomodoroInput = document.getElementById('est-pomodoro')
const saveBtn = document.getElementById('save')
const tasksList = document.getElementById('tasks')
const template = document.getElementById('list-item-template')
const selectedTask = document.getElementById('selected-task')
const audio = document.getElementById('audio')
let tasks = []
let minutes = 25
let seconds = 60
let pause = true
let pomodoro = "pomodoro"
let pomodorosCompleted = 0
let selectedTaskElement

// event listener for pomodoro buttons
document.addEventListener('click', e => {
    if(!e.target.matches('.button')) return

    // reset when pomodoro button selected
    pause = true
    seconds = 60
    startBtn.innerHTML = "Start"

    // only selected button has selected class
    pomodoroBtns.forEach(button => {
        button.classList.remove('selected')
    })
    e.target.classList.add('selected')

    // set timer
    if(e.target.matches('#pomodoro-btn')) {
        countdownTimer.innerHTML = '25:00'
        pomodoro = "pomodoro"
        minutes = 25
    } else if(e.target.matches('#short-break-btn')) {
        countdownTimer.innerHTML = '05:00'
        pomodoro = "short break"
        minutes = 5
    } else if(e.target.matches('#long-break-btn')) {
        countdownTimer.innerHTML = '15:00'
        pomodoro = "long break"
        minutes = 15
    }
})

// event listener for start button
startBtn.addEventListener('click', () => {
    // if countdown is paused, start/resume countdown, otherwise, pause countdown
    if (pause) {
        startBtn.innerHTML = "Pause"
        pause = false
        countdown() 
    } else if (!pause) {
        startBtn.innerHTML = "Start"
        pause = true
    }
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
    const listItem = templateClone.querySelector('.list-item')
    listItem.dataset.taskId = task.id
    const checkbox = templateClone.querySelector('input[type=checkbox]')
    checkbox.checked = task.complete
    const taskName = templateClone.querySelector('.task-name')
    taskName.innerHTML = task.name
    const pomodoroCount = templateClone.querySelector('.pomodoro-count')
    pomodoroCount.innerHTML = task.completedPomodoros.toString() + '/' + task.totalPomodoros
    tasksList.appendChild(templateClone)
}

// countdown function
function countdown() {
    // return if countdown is paused
    if(pause) return

    // set minutes and seconds
    let currentMins = minutes - 1
    seconds--
    countdownTimer.innerHTML = (currentMins < 10 ? "0" : "") + currentMins.toString() + ':' + (seconds < 10 ? "0" : "") + String(seconds)

    // count down every second, when a minute is up, countdown one minute
    // when time reaches 0:00, reset
    if(seconds > 0) {
        setTimeout(countdown, 1000);
    } else if(currentMins > 0){
        seconds = 60
        minutes--
        countdown();           
    } else if(currentMins === 0) {
        audio.play()
        reset()        
    }
}

// reset function when countdown ends
function reset() {
    // set to start the next round    
    startBtn.innerHTML = "Start"
    pause = true

    pomodoroBtns.forEach(button => {
        button.classList.remove('selected')
    })

    // if current round is a break, set for pomodoro
    if (pomodoro === "short break" || pomodoro === "long break") {
        pomodoro = "pomodoro"
        countdownTimer.innerHTML = '25:00'
        minutes = 25
        pomodoroBtn.classList.add('selected')
        return
    }

    // if current round is a pomodoro, set for break
    // if less than four pomodoros have been completed, go to short break
    // if four pomodoros have been completed, go to long break
    if (pomodoro === "pomodoro" && pomodorosCompleted < 4) {
        pomodorosCompleted++
        pomodoro = "short break"
        countdownTimer.innerHTML = '05:00'
        minutes = 5
        shortBreakBtn.classList.add('selected')
    } else if (pomodoro === "pomodoro" && pomodorosCompleted === 4) {
        pomodorosCompleted = 0
        pomodoro = "long break"
        countdownTimer.innerHTML = '15:00'
        minutes = 15
        longBreakBtn.classList.add('selected')
    }

    // if a task has been selected
    if (selectedTaskElement != null) {
        const selectedTaskId = selectedTaskElement.dataset.taskId
        const current = tasks.find(task => task.id === selectedTaskId)
        current.completedPomodoros++
        const pomodoroCount = selectedTaskElement.querySelector('.pomodoro-count')
        pomodoroCount.innerHTML = current.completedPomodoros.toString() + '/' + current.totalPomodoros 
    }

    // TODO add option to start next round automatically
}
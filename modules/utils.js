//Displays the message sent via a parameter on the console
export const logging = (message) => !chrome.runtime.error && console.log(message)

export const addZero = (value) => (value < 10 ? "0" : "")

//Options
export const STORAGE_OPTIONS = ["minutes", "seconds", "pause", "countdownTimer", "pbutton"];

//POMODORO MODE
export const POMODORO_MODE = {
  work: {
    description: "pomodoro",
    countdownTimer: "25:00",
    minutes: 25
  },
  shortBreak: {
    description: "short break",
    countdownTimer: "05:00",
    minutes: 5
  },
  longBreak: {
    description: "long break",
    countdownTimer: "15:00",
    minutes: 15
  }
}

//Pomodoro status
export const POMODORO_STATES = {
  start: "Start",
  pause: 'Pause'
}

//60 seconds
export const SIXTY_SECONDS = 60
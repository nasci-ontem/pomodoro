import EmailController from './emailController.js'
import TimerController from './timerController.js'
import urlRequest from './urlRequest.js'

const mobileEnvironments = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
const desktop = '../public/javascripts/desktop.js'
const mobile = '../public/javascripts/mobile.js'

const emailController = new EmailController()
const timerController = new TimerController()
const oneSecond = 1000
let timeFormatted
let timeout

window.addEventListener('load', () => {
  selectTimer('00', '05', '00')
  changeTimerValueOnScreen()
  document.getElementById('signin').addEventListener('click', urlRequest.goToSignInPage)
  document.getElementById('signup').addEventListener('click', urlRequest.goToSignUpPage)
  document.getElementById('execute').addEventListener('click', toggleTimerMode)
  document.getElementById('reload').addEventListener('click', reloadTimer)
  document.getElementById('hours').addEventListener('keydown', () => { if (timerController.isPlaying) toggleTimerModeWhenPlaying() })
  document.getElementById('minutes').addEventListener('keydown', () => { if (timerController.isPlaying) toggleTimerModeWhenPlaying() })
  document.getElementById('seconds').addEventListener('keydown', () => { if (timerController.isPlaying) toggleTimerModeWhenPlaying() })
  document.getElementById('5minutes').addEventListener('click', handlePresetTimeSelection)
  document.getElementById('25minutes').addEventListener('click', handlePresetTimeSelection)
  document.getElementById('50minutes').addEventListener('click', handlePresetTimeSelection)
  document.getElementById('alarm').addEventListener('pause', reloadTimer)
  document.getElementById('message-name').addEventListener('input', element => setEmailName(element.target.value))
  document.getElementById('message-email').addEventListener('input', element => setEmailOrigin(element.target.value))
  document.getElementById('message-title').addEventListener('input', element => setEmailTitle(element.target.value))
  document.getElementById('message-body').addEventListener('input', element => setEmailMessage(element.target.value))
  document.getElementById('submit-message').addEventListener('click', submitMessage)
  if (mobileEnvironments.test(navigator.userAgent)) setUpEnvironmentWithModule(mobile)
  else setUpEnvironmentWithModule(desktop)
})

function handlePresetTimeSelection(event) {
  const timeSplitted = event.target.dataset.time.split(':')
  selectTimer(timeSplitted[0], timeSplitted[1], timeSplitted[2])
  changeTimerValueOnScreen()
  reloadTimer()
}

function selectTimer(hours, minutes, seconds) {
  if (hours > 23) hours = 23
  if (minutes > 59) minutes = 59
  if (seconds > 59) seconds = 59
  timerController.selectTimer(hours, minutes, seconds)
  timeFormatted = timerController.getTimeFormatted()
  updatePresetTimes()
}

function toggleTimerMode() {
  if (timerController.isPlaying) return toggleTimerModeWhenPlaying()
  if (alarmIsPlaying()) return toggleTimerModeWhenAlarmPlaying()

  return toggleTimerModeWhenNotPlaying()
}

function toggleTimerModeWhenPlaying() {
  timerController.toggleTimerMode(false)
  changeExecuteImage()
  stopTimer()
}

function toggleTimerModeWhenAlarmPlaying() {
  timerController.toggleTimerMode(false)
  changeExecuteImage()
  stopAlarm()
}

function toggleTimerModeWhenNotPlaying() {
  timerController.toggleTimerMode(true)
  changeExecuteImage()
  startTimer()
}

function reloadTimer() {
  stopTimer()
  timerController.reloadTimer()
  changeTimerValueOnScreen()
  changeExecuteImage()
  stopAlarm()
}

function stopTimer() {
  clearTimeout(timeout)
}

function startTimer() {
  timeout = setTimeout(countDown, oneSecond)
}

function countDown() {
  updateTimer()
  if (!timerController.timeIsOver()) {
    timeout = setTimeout(countDown, oneSecond)
    return
  }

  reloadTimer()
  playAlarm()
}

function updateTimer() {
  timerController.updateTimer()
  changeTimerValueOnScreen()
}

function changeTimerValueOnScreen() {
  timeFormatted = timerController.getTimeFormatted()
  const timeSplitted = timeFormatted.split(':')
  document.getElementById('hours').value = timeSplitted[0]
  document.getElementById('minutes').value = timeSplitted[1]
  document.getElementById('seconds').value = timeSplitted[2]
}

function updatePresetTimes() {
  const optionItems = document.querySelectorAll('.timer__options--item')
  optionItems.forEach(option => {
    if (option.dataset.time === timeFormatted) option.classList.add('selected')
    else option.classList.remove('selected')
  })
}

function alarmIsPlaying() {
  return !document.getElementById('alarm').paused
}

function playAlarm() {
  const alarm = document.getElementById('alarm')
  alarm.currentTime = 0
  alarm.play()
}

function stopAlarm() {
  const alarm = document.getElementById('alarm')
  alarm.pause()
  alarm.currentTime = 0
}

function changeExecuteImage() {
  document.getElementById('execute').src = timerController.isPlaying ? '../public/sources/pause.png' : '../public/sources/play.png'
}

function setEmailName(name) {
  emailController.name = name
}

function setEmailOrigin(origin) {
  emailController.origin = origin
}

function setEmailTitle(title) {
  emailController.title = title
}

function setEmailMessage(message) {
  emailController.message = message
}

function submitMessage(event) {
  event.preventDefault()
  emailController.sendEmail()
}

/**
 * Method responsible for setting up the DOM
 * with the environment correspondent script,
 * to avoid extra script loading.
 */
function setUpEnvironmentWithModule(module) {
  const head = document.querySelector('head')
  const script = document.createElement('script')
  script.type = 'module'
  script.src = module
  head.appendChild(script)
}

export { selectTimer }
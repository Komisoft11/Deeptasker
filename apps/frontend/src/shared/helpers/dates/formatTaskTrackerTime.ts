export function formatTaskTrackerTime(sec: number) {
  let minutes = Math.floor(sec / 60)
  let hours = Math.floor(minutes / 60)

  minutes = minutes % 60
  sec = sec % 60

  return `${padStart(hours)}:${padStart(minutes)}:${padStart(sec)}`
}

function padStart(num: number) {
  return num.toString().padStart(2, '0')
}

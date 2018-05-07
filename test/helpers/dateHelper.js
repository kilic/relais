const DAY = 86400

function now() {
  return Math.round(new Date().getTime()/1000)
}

function yesterday() {
  return Math.round(new Date().getTime()/1000) - DAY
}

function daysAhead(days) {
  return Math.round(new Date().getTime()/1000) + DAY*days
}

module.exports = {now,yesterday,daysAhead}


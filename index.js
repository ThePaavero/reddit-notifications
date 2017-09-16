const axios = require('axios')
const notifier = require('node-notifier')
const opn = require('opn')
const fs = require('fs')

const subs = process.argv[2].split(',').map(sub => sub.trim())
const callIntervalInSeconds = 10
let responses = null
const diskStatePath = __dirname + '/STATE'

const notifyForSub = (sub, latestPostTitle) => {
  console.log('Notifying for sub "' + sub + '"')
  notifier.notify({
    title: '/r/' + sub + ' has a new post',
    message: 'Click to see:\n' + latestPostTitle,
    wait: true
  }).on('click', () => {
    opn('https://www.reddit.com/r/' + sub, {
      app: ['chrome']
    })
  })
}

const writeToDiskState = (payloadAsObject) => {
  fs.writeFile(diskStatePath, JSON.stringify(payloadAsObject), err => {
    if (err) {
      console.error(err)
    }
  })
}

const createDiskStateFileIfDoesntExist = () => {
  if (fs.existsSync(diskStatePath)) {
    return
  }
  fs.writeFile(diskStatePath, '{}', err => {
    if (err) {
      console.log('ERROR: Could not create state file on disk!')
    }
  })
}

const loadStateFromDisk = () => {
  if (!fs.existsSync(diskStatePath)) {
    return {}
  }
  return fs.readFileSync(diskStatePath)
}

const tick = () => {
  subs.forEach(sub => {
    const url = 'https://www.reddit.com/r/' + sub + '/new/.json'
    axios.get(url).then(response => {
      const latestPostId = response.data.data.children[0].data.id
      const previousResponse = responses[sub] ? responses[sub] : null
      if (previousResponse !== latestPostId) {
        notifyForSub(sub, response.data.data.children[0].data.title)
      }
      responses[sub] = latestPostId
      writeToDiskState(responses)
    }).catch(console.error)
  })
}

const init = () => {
  createDiskStateFileIfDoesntExist()
  responses = loadStateFromDisk()
  tick()
  setInterval(tick, callIntervalInSeconds * 1000)
}

init()

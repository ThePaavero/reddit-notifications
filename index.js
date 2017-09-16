const axios = require('axios')
const notifier = require('node-notifier')
const opn = require('opn')
const fs = require('fs')

const subs = process.argv[2].split(',').map(sub => sub.trim())
const callIntervalInSeconds = 30
let loggedLatestPostsIds = null
const diskStatePath = __dirname + '/STATE'

const notifyForSub = (sub, latestPostTitle, latestPostUrl) => {
  console.log('Notifying for sub "' + sub + '"')
  notifier.notify({
    title: '/r/' + sub + ' has a new post',
    message: 'Click to see:\n' + latestPostTitle,
    wait: true
  }).on('click', () => {
    opn(latestPostUrl, {
      app: ['chrome']
    })
  })
}

const writeToDiskState = (payloadAsObject) => {
  fs.writeFileSync(diskStatePath, JSON.stringify(payloadAsObject))
}

const createDiskStateFileIfDoesNotExist = () => {
  if (fs.existsSync(diskStatePath)) {
    return
  }
  writeToDiskState({})
}

const loadStateFromDisk = () => {
  if (!fs.existsSync(diskStatePath)) {
    return {}
  }
  return JSON.parse(fs.readFileSync(diskStatePath))
}

const tick = () => {
  subs.forEach(sub => {
    const url = 'https://www.reddit.com/r/' + sub + '/new/.json'
    axios.get(url).then(response => {
      const latestPost = response.data.data.children[0].data
      const previousResponseId = loggedLatestPostsIds[sub] ?
          loggedLatestPostsIds[sub] :
          null
      if (previousResponseId !== latestPost.id) {
        const link = 'https://www.reddit.com' + latestPost.permalink
        notifyForSub(sub, latestPost.title, link)
      }
      loggedLatestPostsIds[sub] = latestPost.id
      writeToDiskState(loggedLatestPostsIds)
    }).catch(console.error)
  })
}

const init = () => {
  createDiskStateFileIfDoesNotExist()
  loggedLatestPostsIds = loadStateFromDisk()
  setTimeout(tick, 1000)
  setInterval(tick, callIntervalInSeconds * 1000)
}

init()

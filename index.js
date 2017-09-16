const axios = require('axios')
const notifier = require('node-notifier')
const opn = require('opn')

const subs = process.argv[2].split(',').map(sub => sub.trim())
const responses = {}

const notifyForSub = (sub) => {
  console.log('Notifying for sub "' + sub + '"')
  notifier.notify({
    message: 'There\'s at least one new post in /r/' + sub + '!',
    wait: true
  }).on('click', () => {
    opn('https://www.reddit.com/r/' + sub, {
      app: ['chrome']
    })
  })
}

const tick = () => {
  subs.forEach(sub => {
    axios.get('https://www.reddit.com/r/' + sub + '/.json').then(response => {
      const latestPostId = response.data.data.children[0].data.id
      const previousResponse = responses[sub] ? responses[sub] : null
      if (previousResponse !== latestPostId) {
        notifyForSub(sub)
      }
      responses[sub] = latestPostId
    }).catch(console.error)
  })
}

const init = () => {
  tick()
  setInterval(tick, 10000)
}

init()

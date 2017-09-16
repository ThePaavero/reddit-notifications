const axios = require('axios')
const subs = process.argv[2].split(',').map(sub => sub.trim())
const responses = {}
subs.forEach(sub => {
  axios.get('https://www.reddit.com/r/' + sub + '/.json').then(response => {
    const data = response.data
    let newPostsDetected = false
    const previousResponse = responses.sub ? responses.sub : null
    if (!previousResponse || previousResponse !== data) {
      newPostsDetected = true
    }
    responses.sub = JSON.parse(data)
  })
})

# Reddit Notifications
Get notifications for new posts in X subreddits.

## Install
```
$ git clone https://github.com/ThePaavero/reddit-notifications.git
$ cd reddit-notifications
$ yarn
```

## Use
#### Single subreddit
```
$ node index.js funny 
```
#### Multiple subreddits
```
$ node index.js funny,interestingasfuck,programming
```

## Bugs
* The click listener will open ALL links, don't know why...
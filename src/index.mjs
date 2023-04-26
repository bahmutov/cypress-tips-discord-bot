// https://discord.js.org/docs/packages/core/0.5.2
import { REST } from '@discordjs/rest'
import { API } from '@discordjs/core'

if (!process.env.CYPRESS_TIPS_BOT_TOKEN) {
  throw new Error('Missing CYPRESS_TIPS_BOT_TOKEN')
}

// Create REST instance
const rest = new REST({ version: '10' }).setToken(
  process.env.CYPRESS_TIPS_BOT_TOKEN,
)

// Pass into API
const api = new API(rest)

if (!process.env.BLOG_CHANNEL_ID) {
  throw new Error('Missing BLOG_CHANNEL_ID')
}
const channels = {
  testing1: process.env.BLOG_CHANNEL_ID,
}

function postMessage(content) {
  return api.channels.createMessage(channels.testing1, { content }).then(
    () => {
      console.log('posted message')
    },
    (e) => {
      console.error(e)
    },
  )
}

function getMessages() {
  return api.channels.getMessages(channels.testing1).then(
    (allMessages) => {
      console.log('got %d messages', allMessages.length)
      const myMessages = allMessages.filter(
        (m) => m.author.username === 'cypress.tips',
      )
      console.log('got %d cypress.tips messages', myMessages.length)
      myMessages.forEach((m, k) => {
        console.log(
          '%d / %d %s %s',
          k + 1,
          myMessages.length,
          m.timestamp,
          m.content,
        )
      })
    },
    (e) => {
      console.error(e)
    },
  )
}
getMessages()

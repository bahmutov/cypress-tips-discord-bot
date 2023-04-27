// https://discord.js.org/docs/packages/core/0.5.2
import { REST } from '@discordjs/rest'
import { API } from '@discordjs/core'
import { getModifiedPostUrls } from 'scrape-blog-post-page'
import { DateTime } from 'luxon'

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

function postMessage(content, log = 'posted message') {
  return api.channels.createMessage(channels.testing1, { content }).then(
    () => {
      console.log(log)
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
      // console.log(allMessages)

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
      return myMessages
    },
    (e) => {
      console.error(e)
    },
  )
}
// getMessages()

function leavePostsAfter(date, posts) {
  return posts.filter((post) => {
    const modifiedDate = new Date(post.modified)
    return modifiedDate > date
  })
}

getModifiedPostUrls()
  .then((posts) => {
    console.log('found %d Cypress blog posts', posts.length)
    // only consider the blog posts from the last N days
    const days = 15
    const now = DateTime.now()
    const ago = now.minus({ days })
    const recent = leavePostsAfter(ago.toJSDate(), posts)
    console.log(
      'recent %d blog post(s) from the last %d days',
      recent.length,
      days,
    )
    console.log(recent)
    return recent
  })
  .then(async (recent) => {
    const myMessages = await getMessages()
    const newPosts = recent.filter((post) => {
      const posted = myMessages.some((message) =>
        message.content.includes(post.url),
      )
      return !posted
    })
    console.log('found %d blog post(s) to be messaged', newPosts.length)
    for (const newPost of newPosts) {
      await postMessage(
        `📝 New blog post "${newPost.title}" ${newPost.subtitle} ${newPost.url}`,
        `posted "${newPost.title}"`,
      )
    }
  })

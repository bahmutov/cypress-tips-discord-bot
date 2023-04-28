// https://discord.js.org/docs/packages/core/0.5.2
import { REST } from '@discordjs/rest'
import { API } from '@discordjs/core'
import { getModifiedPostUrls } from 'scrape-blog-post-page'
import { getPlaylistVideos } from 'scrape-youtube-videos'
import { scrapeCourse } from './scrape-courses.mjs'
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
      return true
    },
    (e) => {
      console.error(e)
      return false
    },
  )
}

function getMessages() {
  return api.channels.getMessages(channels.testing1).then(
    (allMessages) => {
      console.log('got %d messages in the channel', allMessages.length)
      // console.log(allMessages)

      const myMessages = allMessages.filter(
        (m) => m.author.username === 'cypress.tips',
      )
      console.log('got %d cypress.tips messages', myMessages.length)
      // myMessages.forEach((m, k) => {
      //   console.log(
      //     '%d / %d %s %s',
      //     k + 1,
      //     myMessages.length,
      //     m.timestamp,
      //     m.content,
      //   )
      // })
      return myMessages
    },
    (e) => {
      console.error(e)
    },
  )
}
// getMessages()

function leavePostsAfter(date, posts, property = 'modified') {
  return posts.filter((post) => {
    const modifiedDate = new Date(post[property])
    return modifiedDate > date
  })
}

/**
 * Resolves with a boolean signalling the success
 * (but not necessarily if any messages were posted)
 */
async function announceNewBlogPosts() {
  let success = true

  await getModifiedPostUrls()
    .then((posts) => {
      console.log('found %d Cypress blog posts', posts.length)
      // only consider the blog posts from the last N days
      const days = 2
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
        const message = `📝 New blog post "${newPost.title}" ${newPost.subtitle} 🔗 link ${newPost.url}`
        const log = `📯 posted "${newPost.title}"`
        success = success && (await postMessage(message, log))
      }
    })

  return success
}

async function announceNewVideos() {
  let success = true
  await getPlaylistVideos()
    .then((videos) => {
      console.log('found %d Cypress videos', videos.length)
      // only consider the blog posts from the last N days
      const days = 2
      const now = DateTime.now()
      const ago = now.minus({ days })
      const recent = leavePostsAfter(ago.toJSDate(), videos, 'publishedAt')
      console.log(
        'recent %d video(s) from the last %d days',
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
      console.log('found %d video(s) to be messaged', newPosts.length)
      for (const newPost of newPosts) {
        const message = `📺 New video "${newPost.title}" ${newPost.description} 🔗 link ${newPost.url}`
        const log = `📯 posted "${newPost.title}"`
        success = success && (await postMessage(message, log))
      }
    })

  return success
}

async function announceNewPluginsLessons(title) {
  console.log('checking course "%s"', title)
  let success = true

  await scrapeCourse(title)
    .then((lessons) => {
      console.log('found %d %s lessons', lessons.length, title)
      return lessons
    })
    .then(async (recent) => {
      const myMessages = await getMessages()
      const newPosts = recent.filter((post) => {
        const posted = myMessages.some((message) =>
          message.content.includes(post.url),
        )
        return !posted
      })
      console.log('found %d lesson(s) to be messaged', newPosts.length)
      for (const newPost of newPosts) {
        const message = `🎓 Course "${title}" has a new lesson out: "${newPost.title}" ${newPost.description} 🔗 link ${newPost.url}`
        const log = `📯 posted "${newPost.title}"`
        success = success && (await postMessage(message, log))
      }
    })
  return success
}

async function announceNewContent() {
  let success = true
  success = success && (await announceNewBlogPosts())
  success = success && (await announceNewVideos())

  const courses = [
    'Cypress Plugins',
    'Cypress vs Playwright',
    'Testing The Swag Store',
    'Cypress Network Testing Exercises',
  ]
  for (const courseTitle of courses) {
    success = success && (await announceNewPluginsLessons(courseTitle))
  }
  console.log('posting %s', success ? '✅' : 'failed')
  if (!success) {
    process.exit(1)
  }
}

announceNewContent()

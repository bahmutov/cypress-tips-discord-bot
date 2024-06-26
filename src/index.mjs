// https://discord.js.org/docs/packages/core/0.5.2
import { REST } from '@discordjs/rest'
import { API } from '@discordjs/core'
import { getModifiedPostUrls } from 'scrape-blog-post-page'
import { getPlaylistVideos } from 'scrape-youtube-videos'
import { scrapeCourse, courseTitles } from './scrape-courses.mjs'
import { DateTime } from 'luxon'
import { scrapeExamples, examplesUrl } from './scrape-examples.mjs'

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

/**
 * Posts the given items to the channel IF the url was not already posted
 * @param {any[]} items
 * @param {Function} toMessage Converts an item to Discord message
 * @param {Function} toLog Converts an item to console log message
 */
async function postMessages(
  items,
  toMessage,
  toLog = (post) => `📯 posted "${post.title}"`,
  options = {},
) {
  const dry = Boolean(options.dry)

  if (!Array.isArray(items)) {
    throw new Error('Expected an array of items to post')
  }
  let success = true

  const myMessages = await getMessages()
  const newPosts = items.filter((post) => {
    const posted = myMessages.some((message) =>
      message.content.includes(post.url),
    )
    return !posted
  })

  console.log('found %d post(s) to be messaged', newPosts.length)
  for (const newPost of newPosts) {
    const message = toMessage(newPost)
    const log = toLog(newPost)
    if (dry) {
      console.log('dry mode: would be posting the following message')
      console.log(message)
    } else {
      console.log('posting the following message')
      console.log(message)
      console.log('log message')
      console.log(log)
      success = success && (await postMessage(message, log))
    }
  }

  return success
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
async function announceNewBlogPosts(options) {
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
      const toMessage = (newPost) =>
        `📝 New blog post "${newPost.title}" ${newPost.subtitle} 🔗 link ${newPost.url}`
      success =
        success && (await postMessages(recent, toMessage, undefined, options))
    })

  return success
}

export async function announceNewVideos(options) {
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
      const toMessage = (newPost) =>
        `📺 New video "${newPost.title}" ${newPost.description || ''} 🔗 link ${newPost.url}`
      success =
        success && (await postMessages(recent, toMessage, undefined, options))
    })

  return success
}

async function announceNewExamples(options) {
  let success = true
  await scrapeExamples()
    .then((examples) => {
      console.log('found %d Cypress examples', examples.length)
      // only consider the blog posts from the last N days
      const days = 10
      const now = DateTime.now()
      const ago = now.minus({ days })
      const recent = leavePostsAfter(ago.toJSDate(), examples, 'created')
      console.log(
        'recent %d example(s) from the last %d days',
        recent.length,
        days,
      )
      console.log(recent)
      return recent
    })
    .then((posts) => {
      // limit ourselves to one recently added example post only
      if (posts.length) {
        return posts.slice(0, 1)
      }
      return posts
    })
    .then(async (recent) => {
      const toMessage = (newPost) =>
        `📚 New Cypress example "${newPost.title}" 🔗 link ${newPost.url}`
      success =
        success && (await postMessages(recent, toMessage, undefined, options))
    })

  return success
}

async function announceNewPluginsLessons(title, options) {
  console.log('checking course "%s"', title)
  let success = true

  await scrapeCourse(title)
    .then((lessons) => {
      // TODO: need modified timestamp
      // for now limit ourselves to the last video
      return lessons.slice(lessons.length - 1)
    })
    .then((lessons) => {
      console.log('found %d %s lessons', lessons.length, title)
      if (lessons.length > 0 && lessons.length < 3) {
        console.log(lessons)
      }
      return lessons
    })
    .then(async (recent) => {
      const toMessage = (newPost) => {
        const message = `🎓 Course "${title}" has a new lesson out: "${newPost.title}" ${newPost.description || ''} 🔗 link ${newPost.url}`
        console.log(message)
        return message
      }
      success =
        success && (await postMessages(recent, toMessage, undefined, options))
    })
  return success
}

export async function announceNewContent(options = {}) {
  const dry = Boolean(options.dry)
  const type = options.type
  const postOptions = { dry }

  let success = true

  if (type) {
    if (type === 'post') {
      success = success && (await announceNewBlogPosts(postOptions))
    } else if (type === 'video') {
      success = success && (await announceNewVideos(postOptions))
    } else if (type === 'example') {
      success = success && (await announceNewExamples(postOptions))
    } else if (type === 'course') {
      for (const courseTitle of courseTitles) {
        success =
          success && (await announceNewPluginsLessons(courseTitle, postOptions))
      }
    } else {
      throw new Error(`Unknown type "${type}"`)
    }
  } else {
    success = success && (await announceNewBlogPosts(postOptions))
    success = success && (await announceNewVideos(postOptions))
    success = success && (await announceNewExamples(postOptions))
    for (const courseTitle of courseTitles) {
      success =
        success && (await announceNewPluginsLessons(courseTitle, postOptions))
    }
  }

  return success
}

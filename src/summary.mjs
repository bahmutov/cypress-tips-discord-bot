import { getBlogPostUrls } from 'scrape-blog-post-page'
import { getPlaylistVideos } from 'scrape-youtube-videos'
import { scrapeCourse, courseTitles } from './scrape-courses.mjs'

async function getSummary() {
  const summary = []
  const blogPosts = await getBlogPostUrls()
  summary.push({
    content: 'Cypress blog posts',
    n: blogPosts.length,
  })

  const videos = await getPlaylistVideos()
  summary.push({
    content: 'Cypress.tips & Tricks videos',
    n: videos.length,
  })

  for (const courseTitle of courseTitles) {
    const lessons = await scrapeCourse(courseTitle)
    summary.push({
      content: courseTitle,
      n: lessons.length,
    })
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/Console/table
  console.table(summary)
}

getSummary()

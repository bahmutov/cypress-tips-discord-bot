import { getBlogPostUrls, cypressBlogPostsUrl } from 'scrape-blog-post-page'
import {
  getPlaylistVideos,
  cypressTipsPlaylistUrl,
} from 'scrape-youtube-videos'
import { scrapeCourse, courseTitles, getCourseUrl } from './scrape-courses.mjs'
import { scrapeExamples, examplesUrl } from './scrape-examples.mjs'
import ghCore from '@actions/core'

async function getSummary() {
  const summary = []
  const blogPosts = await getBlogPostUrls()
  summary.push({
    content: '📝 Cypress blog posts',
    n: blogPosts.length,
    url: cypressBlogPostsUrl,
  })

  const videos = await getPlaylistVideos()
  summary.push({
    content: '📺 Cypress Tips & Tricks videos',
    n: videos.length,
    url: cypressTipsPlaylistUrl,
  })

  const examples = await scrapeExamples()
  summary.push({
    content: '📚 Cypress Examples',
    n: examples.length,
    url: examplesUrl,
  })

  for (const courseTitle of courseTitles) {
    const lessons = await scrapeCourse(courseTitle)
    summary.push({
      content: `🎓 ${courseTitle}`,
      n: lessons.length,
      url: getCourseUrl(courseTitle),
    })
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/Console/table
  console.table(summary)

  if (process.env.GITHUB_ACTIONS) {
    // create summary on GitHub workflow
    const headers = [
      {
        data: 'Content',
        header: true,
      },
      {
        data: 'N',
        header: true,
      },
    ]
    // all cells should be strings
    const rows = summary.map((item) => {
      const cells = [item.content, String(item.n)]
      return cells
    })
    console.log(headers)
    console.log(rows)
    ghCore.summary
      .addHeading('My Cypress output')
      .addTable([headers, ...rows])
      .addLink('cypress.tips/search', 'https://cypress.tips/search')
      .write()
  }
}

getSummary()

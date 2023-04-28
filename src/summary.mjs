import { getBlogPostUrls } from 'scrape-blog-post-page'
import { getPlaylistVideos } from 'scrape-youtube-videos'
import { scrapeCourse, courseTitles } from './scrape-courses.mjs'
import ghCore from '@actions/core'

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

  if (process.env.GITHUB_ACTIONS) {
    // create summary on GitHub workflow
    const rows = [
      {
        data: 'Content',
        header: true,
      },
      {
        data: 'N',
        header: true,
      },
    ].concat(
      summary.map((item) => {
        return [item.content, item.n]
      }),
    )
    console.log(rows)
    ghCore.summary
      .addHeading('My Cypress output')
      .addTable(rows)
      .addLink('cypress.tips/search', 'https://cypress.tips/search')
      .write()
  }
}

getSummary()

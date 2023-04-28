import Debug from 'debug'
import got from 'got'

const debug = Debug('cypress-tips-discord-bot')
const courseIds = {
  'Cypress Plugins': 'coztjw6spx',
  'Cypress vs Playwright': 'co7afj5vav',
  'Testing The Swag Store': 'coj0pt0v7t',
  'Cypress Network Testing Exercises': 'covt2fpsux',
}
const courseSlugs = {
  'Cypress Plugins': 'cypress-plugins',
  'Cypress vs Playwright': 'cypress-vs-playwright',
  'Testing The Swag Store': 'swag-store',
  'Cypress Network Testing Exercises': 'network-testing',
}
const courseBaseUrl = 'https://cypress.tips/courses'

export const courseTitles = [
  'Cypress Plugins',
  'Cypress vs Playwright',
  'Testing The Swag Store',
  'Cypress Network Testing Exercises',
]

export function getCourseUrl(title) {
  const courseSlug = courseSlugs[title]
  if (!courseSlug) {
    throw new Error(`Could not find course slug "${title}"`)
  }
  debug('course slug %s', courseSlug)
  const courseUrl = courseBaseUrl + '/' + courseSlug
  debug('course url %s', courseUrl)

  return courseUrl
}

export async function scrapeCourse(title) {
  debug('scraping course %s', title)

  const id = courseIds[title]
  if (!id) {
    throw new Error(`Could not find course "${title}"`)
  }
  debug('course id %s', id)

  const courseUrl = getCourseUrl(title)
  debug('course url %s', courseUrl)

  const url = `https://api.coursekit.dev/v1/courses/${id}`
  const course = await got(url).json()
  debug(course)
  console.log('course "%s" has %d lessons', title, course.lessons.length)

  const lessons = course.lessons.map((l) => {
    return {
      title: l.title,
      description: l.publicContent?.description,
      id: l.id,
      url: courseUrl + '/lessons/' + l.id,
    }
  })

  return lessons
}

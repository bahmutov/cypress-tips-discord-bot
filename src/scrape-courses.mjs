// @ts-check
import Debug from 'debug'
import got from 'got'

const debug = Debug('cypress-tips-discord-bot')

const courseBaseUrl = 'https://cypress.tips/courses'

/**
 * @typedef {Object} CourseDefinition
 * @property {string} title - The title of the course.
 * @property {string} slug - The slug of the course.
 * @property {string} id - The unique identifier of the course.
 */

/** @type {CourseDefinition[]} */
const listOfCourses = [
  {
    title: 'Testing The Swag Store',
    slug: 'swag-store',
    id: 'coj0pt0v7t',
  },
  {
    title: 'Cypress vs Playwright',
    slug: 'cypress-vs-playwright',
    id: 'co7afj5vav',
  },
  {
    title: 'Cypress-split Plugin',
    slug: 'cypress-split',
    id: 'cov1ad6pdh',
  },
  {
    title: 'TDD Calculator',
    id: 'con6p7gvh5',
    slug: 'tdd-calculator',
  },
  {
    title: 'Cypress Plugins',
    slug: 'cypress-plugins',
    id: 'coztjw6spx',
  },
  {
    title: 'Cypress Network Testing Exercises',
    slug: 'network-testing',
    id: 'covt2fpsux',
  },
  {
    id: 'cov8byve72',
    slug: 'visual-testing',
    title: 'Visual Testing With Cypress',
  },
  {
    id: 'co7fdsq21w',
    slug: 'cy-copilot',
    title: 'Write Cypress Tests Using GitHub Copilot',
  },
]

const courseIds = {}
const courseSlugs = {}

listOfCourses.forEach((course) => {
  courseIds[course.title] = course.id
  courseSlugs[course.title] = course.slug
})

export const courseTitles = listOfCourses.map((c) => c.title)

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

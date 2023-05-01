import { scrapeCourse } from '../src/scrape-courses.mjs'

scrapeCourse('Cypress Plugins').then((lessons) => {
  lessons.forEach((lesson) => {
    console.log(lesson.title)
    console.log(lesson.url)
  })
})

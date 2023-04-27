import { scrapeCourse } from '../src/scrape-courses.mjs'

scrapeCourse('Cypress Plugins').then((videos) => {
  videos.forEach((video) => {
    console.log(video.title)
    console.log(video.url)
  })
})

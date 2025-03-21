# cypress-tips-discord-bot [![Scrape](https://github.com/bahmutov/cypress-tips-discord-bot/actions/workflows/scrape.yml/badge.svg?branch=main)](https://github.com/bahmutov/cypress-tips-discord-bot/actions/workflows/scrape.yml) [![Summary](https://github.com/bahmutov/cypress-tips-discord-bot/actions/workflows/summary.yml/badge.svg?branch=main)](https://github.com/bahmutov/cypress-tips-discord-bot/actions/workflows/summary.yml)

Scrapes my blog posts, youtube videos, and [cypress.tips/courses](https://cypress.tips/courses) and posts the links to Discord. Only posts the summaries, not the content.

- [x] every 24 hours (in the middle of the day EST)
- [x] read the Cypress blog posts (limit to the last 24 hours)
- [x] post each blog post link to my Discord server channel `testing1`
- [ ] post each blog post link to my Discord server channel `blog-feed`

## Post new content

### Dry mode

You can prepare the messages but not post them using `--dry` mode

### Scrape one type only

You can scrape just a single type of content

```
node ./bin/post-new-content.mjs --type example
```

Allowed values: `post`, `video`, `example`, and `course`

## Debugging

Run with `DEBUG=cypress-tips-discord-bot` environment variable

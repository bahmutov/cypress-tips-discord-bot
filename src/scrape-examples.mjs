import Debug from 'debug'
import got from 'got'

const debug = Debug('cypress-tips-discord-bot')

export const examplesUrl = 'https://glebbahmutov.com/cypress-examples/'

export async function scrapeExamples() {
  const fiddlesUrl = examplesUrl + 'fiddles.json'
  debug('loading examples from %s', fiddlesUrl)

  const fiddles = await got(fiddlesUrl).json()
  if (Array.isArray(fiddles)) {
    debug('first cypress example from %s', fiddlesUrl)
    debug(fiddles[0])
  }

  console.log('got %d examples from %s', fiddles.length, fiddlesUrl)
  return fiddles
}

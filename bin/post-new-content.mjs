import Debug from 'debug'
import { announceNewContent } from '../src/index.mjs'
import arg from 'arg'
const debug = Debug('cypress-tips-discord-bot')

const args = arg({
  '--dry': Boolean,
})

debug('arguments %o', args)

announceNewContent({
  dry: args['--dry'],
})
  .then((success) => {
    console.log('posting %s', success ? 'worked ✅' : 'failed 🚨')
    if (!success) {
      process.exit(1)
    }
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

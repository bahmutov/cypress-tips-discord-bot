import Debug from 'debug'
import { announceNewContent } from '../src/index.mjs'
import arg from 'arg'
const debug = Debug('cypress-tips-discord-bot')

const args = arg({
  '--dry': Boolean,
  // Optional: "post", "video", "example", "course"
  '--type': String,
})

debug('arguments %o', args)

const validTypes = ['post', 'video', 'example', 'course']
if (args['--type']) {
  if (!validTypes.includes(args['--type'])) {
    console.error('Invalid type "%s"', args['--type'])
    process.exit(1)
  } else {
    console.log('posting only type "%s"', args['--type'])
  }
}

announceNewContent({
  dry: args['--dry'],
  type: args['--type'],
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

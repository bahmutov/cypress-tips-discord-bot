import { announceNewContent } from '../src'

announceNewContent()
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

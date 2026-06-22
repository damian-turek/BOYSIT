import * as dotenv from 'dotenv'

import app from './app'

dotenv.config()

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`🚀 Serwer wystartował na porcie: http://localhost:${PORT}`)
})

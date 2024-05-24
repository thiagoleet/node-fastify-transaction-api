import { env } from './env'
import { app } from './app'

app
  .listen({
    port: env.PORT,
    host: 'RENDER' in process.env ? '0.0.0.0' : 'localhost',
  })
  .then(() => {
    console.log(`Server is running on port ${env.PORT}`)
  })

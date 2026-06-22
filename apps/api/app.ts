import cors from 'cors'
import express, { Request, Response } from 'express'
import helmet from 'helmet'

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'working',
    message: 'Serwer Express działa z app.ts!',
  })
})

export default app

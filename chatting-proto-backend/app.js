import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import cors from 'cors'

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'public'))

// CORS
app.use(cors())

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.get(/.*/, (req, res, next) => {
  res.render('index.html')
})

export default app

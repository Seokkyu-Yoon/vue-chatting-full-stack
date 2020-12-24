import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import ejs from 'ejs'
import cors from 'cors'

const app = express()

// view engine setup
app.set('views', path.join(__dirname, '..', 'chatting-proto-frontend', 'dist'))
app.set('view engine', 'ejs')
app.engine('html', ejs.renderFile)

// CORS
app.use(cors())

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, '..', 'chatting-proto-frontend', 'dist')))

app.get(/.*/, (req, res, next) => {
  res.render('index.html')
})

export default app

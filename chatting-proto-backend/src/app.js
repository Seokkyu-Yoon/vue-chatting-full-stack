import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import cors from 'cors'
import ejs from 'ejs'
import { routerApi } from './router'

const app = express()

// view engine setup
app.set('views', path.join(__dirname, '..', 'public'))
app.engine('html', ejs.renderFile)
app.set('view engine', 'ejs')

// CORS
app.use(cors())

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, '..', 'public')))

app.use('/api', routerApi)

app.get('/', (req, res, next) => {
  res.render('index.html')
})

app.get('/*', (req, res, next) => {
  res.redirect('/')
})

export default app

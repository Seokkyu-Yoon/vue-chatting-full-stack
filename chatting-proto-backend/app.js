const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const ejs = require('ejs');
const cors = require('cors');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, '..', 'chatting-proto-frontend', 'dist'));
app.set('view engine', 'ejs');
app.engine('html', ejs.renderFile);

// CORS
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'chatting-proto-frontend', 'dist')));

app.get(/.*/, (req, res, next) => {
  res.render('index.html');
});

module.exports = app;

const express = require('express');
const movies = require('./router/movie-router');

const app = express();

app.use('/api/v1/movies', movies);

module.exports = app;
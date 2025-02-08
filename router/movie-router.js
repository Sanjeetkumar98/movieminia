const express = require('express');
const moviesController = require('../controllers/movies-controller');
const authController = require('../controllers/authController');

const router = express.Router();

router.route("/movie-stats").get(moviesController.getMovieStats);
router.route("/movie-by-genre/:genre").get(moviesController.getMovieByGenres);

router.route('/')
      .get(authController.protect, moviesController.getAllMovies)
      .post(moviesController.createMovies)

router.route('/:id')
      .get(moviesController.getMovie)
      .patch(moviesController.updateMovies)
      .delete(authController.protect, authController.restrict('admin'), moviesController.deleteMovies)
      

module.exports = router;      
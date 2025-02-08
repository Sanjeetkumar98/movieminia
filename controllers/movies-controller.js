const express = require('express');
const Movie = require('../model/movie-model');
const ApiFeatures = require('../Utils/ApiFeatures');
const asyncErrorHandler = require('../Utils/asyncErrorHandler');
const CustomError = require('../Utils/CustomError');


exports.getAllMovies = asyncErrorHandler(async (req, res, next) => {

  const features = new ApiFeatures(Movie.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  let movies = await features.query;

  res.status(200).json({
    status: "Success",
    lenght: movies.length,
    data: {
      movies
    }
  });
})

exports.getMovie = asyncErrorHandler(async (req, res, next) => {

  const movie = await Movie.findById(req.params.id);

  if (!movie) {
    const error = new CustomError('Movie with that ID is not Found', 404);
    return next(error);
  }

  res.status(201).json({
    status: "Success",
    data: {
      movie
    }
  });
})

exports.createMovies = asyncErrorHandler(async (req, res, next) => {

  const movie = await Movie.create(req.body);

  res.status(201).json({
    status: "Success",
    data: {
      movie
    }
  });
})

exports.updateMovies = asyncErrorHandler(async (req, res, next) => {

  const updateMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

  if (!updateMovie) {
    const error = new CustomError('Movie with that ID is not found', 404);
    return next(error);
  }

  res.status(201).json({
    status: "Success",
    data: {
      movie: updateMovie
    }
  });
})

exports.deleteMovies = asyncErrorHandler(async (req, res, next) => {

  const deleteMovie = await Movie.findByIdAndDelete(req.params.id);

  if (!deleteMovie) {
    const error = new CustomError('Movie with that ID is not found', 404);
    return next(error);
  }

  res.status(200).json({
    status: "Success",
    data: null
  });
})

exports.getMovieStats = asyncErrorHandler(async (req, res, next) => {

  const stats = await Movie.aggregate([
    { $match: { rating: { $gte: 5.5 } } },
    {
      $group: {
        _id: '$releasedYear',
        avgRating: { $avg: '$rating' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        totalPrice: { $sum: '$price' },
        countMovie: { $sum: 1 }
      }
    },
    { $sort: { minPrice: 1 } }
  ]);

  res.status(200).json({
    status: "success",
    count: stats.length,
    data: {
      stats
    }
  });
})

exports.getMovieByGenres = asyncErrorHandler(async (req, res, next) => {

  const genre = req.params.genre;
  const movies = await Movie.aggregate([
    { $unwind: '$genres' },
    {
      $group: {
        _id: '$genres',
        movieCount: { $sum: 1 },
        movies: { $push: '$name' }
      }
    },
    { $addFields: { genre: '$_id' } },
    { $project: { _id: 0 } },
    { $sort: { movieCount: -1 } }
  ]);

  res.status(200).json({
    status: "success",
    count: movies.length,
    data: {
      movies
    }
  });
})

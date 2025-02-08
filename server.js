require("dotenv").config();
const express = require('express');
const movies = require('./router/movie-router');
const mongoose = require('mongoose');
const globalErrorHandler = require('./controllers/errorController');
const CustomError = require('./Utils/CustomError');
const authRouter = require('./router/authRouter');
const userRouter = require('./router/userRouter');

const URI = process.env.DATABASE_KEY;


const port = process.env.PORT || 3000;

process.on('uncaughtException', (err) => {
    console.log(err.name, err.message);
    console.log('Uncaught exception occured! Shutting down...');
    process.exit(1);
})

const app = express();
app.use(express.json());

app.use('/api/v1/movies', movies);
app.use('/api/v1/auth', authRouter);
app.use("/api/v1/user", userRouter);

// const app = require('./app');
app.all("*",(req, res, next)=>{

    const err = new CustomError(`Can't find ${req.originalUrl} on the server!`, 404);
    next(err);
});

app.use(globalErrorHandler);

mongoose.connect(URI, {
    useNewUrlParser: true
}).then((conn) => {
    console.log('Database connection successful');
}).catch((err) => {
    console.log('Database connection failed.');
})



app.listen(port, () => {
    console.log(`Server is running at port : ${port}`);
});


// process.on('unhandledRejection', (err) => {
//     console.log(err.name, err.message);
//     console.log('Unhandled rejection occured! Shutting down...');

//     server.close(() => {
//         process.exit(1);
//     })
// })


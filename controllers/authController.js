const express = require('express');
const User = require('./../model/userModel');
const asyncErrorHandler = require('./../Utils/asyncErrorHandler');
const jwt = require('jsonwebtoken');
const CustomError = require('../Utils/CustomError');
const util = require('util');
const sendEmail = require('../Utils/email');
const crypto = require('crypto');

const signToken = id => {
    return jwt.sign({ id }, process.env.SECRET_KEY, {
        expiresIn: process.env.EXPIRES
    });
}


exports.signup = asyncErrorHandler(async (req, res, next) => {
    const newUser = await User.create(req.body);

    const token = signToken(newUser._id);

        res.status(201).json({
            status: "success",
            token,
            data: {
                user: newUser
            }
        });
})

exports.login = asyncErrorHandler(async (req, res, next) => {
    const password = req.body.password;
    const email = req.body.email;

    if (!email || !password) {
        const error = new CustomError('Please provide email ID & password for login!', 400);
        return next(error);
    }

    const user = await User.findOne({ email }).select('+password');

    // const isMatch = await user.comparePasswordInDb(password, user.password);

    if (!user || !(await user.comparePasswordInDb(password, user.password))) {
        const error = new CustomError('Incorrect email or password', 400);
        return next(error);
    }

    const token = signToken(user._id);

    res.status(200).json({
        status: "success",
        token
    });
});

exports.protect = asyncErrorHandler(async (req, res, next) => {
    //1. Read the token & check if it exist
    const testToken = req.headers.authorization;

    let token;
    if(testToken && testToken.startsWith('bearer')){
        token = testToken.split(' ')[1];
    }
    if(!token){
        next(new CustomError('You are not logged in.', 401));
    }

    //2. Validate the token
    const decodedToken = await util.promisify(jwt.verify)(token, process.env.SECRET_KEY);

    //3. If the user exists
    const user = await User.findById(decodedToken.id);

    if(!user){
        const error = new CustomError('The user with this given token does not exist.', 401);
        return next(error);
    }

    //4. If the user changed password after the token was issued
    const isPasswordChanged = await user.isPasswordChange(decodedToken.iat);
    if(isPasswordChanged){
        const error = new CustomError('The password has been changed recently. Please login again!', 401);
        return next(error);
    }

    //5. Allow user to access route
    req.user = user;
    next();
});

exports.restrict = (role) => {
    return (req, res, next) => {
        if(!req.user.role !== role){
            const error = new CustomError('You have not permission to perform this action', 403);
            next(error);
        }
        next();
    }
}

// exports.restrict = (...role) => {
//     return (req, res, next) => {
//         if(!role.includes(req.user.role)){
//             const error = new CustomError('You have not permission to perform this action', 403);
//             next(error);
//         }
//         next();
//     }
// }

exports.forgetPassword = asyncErrorHandler(async (req, res, next) => {
    //1. GET USER WITH EMAIL
    const user = await User.findOne({email: req.body.email});

    if(!user){
        const error = new CustomError('We could not find the user with given email', 404);
        return next(error);
    }

    //2. CREATE RESET TOKEN
    const resetToken = user.createResetPasswordToken();

    await user.save({validateBeforeSave: false});

    //3. SEND EMAIL TO USER WITH RESET TOKEN
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `We have receive a password reset request. Please use the below link to reset password\n\n${resetUrl}\n\nThis reset password link will be valid only for 10 minutes.`;

    try{
        await sendEmail({
            email: user.email,
            subject: 'Password change request received',
            message
        });

        res.status(200).json({
            status: "success",
            message: 'Password link send to the user email'
        });
    }catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpires= undefined;

        user.save({validateBeforeSave: false});

        return next(new CustomError('There was an error sending reset password email. Please try again later!',500));
    }
    
});

exports.resetPassword = asyncErrorHandler(async (req, res, next) => {
    const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({passwordResetToken: token, passwordResetTokenExpires: {$gt: Date.now()}});

    if(!user){
        const error = new CustomError('Invalid token or has expired', 400);
        return next(error);
    }

    user.password = req.body.password;
    user.conformPassword = req.body.conformPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.passwordChangedAt = Date.now();

    user.save();

    const loginToken =  signToken(user._id);

    res.status(200).json({
        status: "success",
        token: loginToken
    });
});



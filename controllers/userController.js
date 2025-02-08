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

const filterReqObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(prop => {
        if(allowedFields.includes(prop))
            newObj[prop] = obj[prop];
    })
    return
}


exports.updatePassword = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    if(!(await user.comparePasswordInDb(req.body.currentPassword, user.password))){
        const error = new CustomError('The current password you provided is wrong', 401);
        return next(error);
    }

    user.password = req.body.password;
    user.conformPassword = req.body.conformPassword;

    await user.save();

    const token = signToken(user._id);

    res.status(200).json({
        status: "success",
        token,
        data: {
            user
        }
    });
});

exports.updateMe = asyncErrorHandler(async (req, res, next) => {
    if(req.body.password || req.body.conformPassword){
        return next(new CustomError('You cannot update password using this endpoint', 400));
    }

    const filterObj = filterReqObj(req.body, 'name', 'email');
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filterObj, {runValidators: true, new: true});

    res.status(200).json({
        status: "success",
        data: {
            user: updatedUser
        }
    });
});
const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.route("/updatePassword").patch(
    authController.protect, 
    userController.updatePassword
);

router.route("/updateMe").patch(
    authController.protect,
    userController.updateMe
);


module.exports = router;
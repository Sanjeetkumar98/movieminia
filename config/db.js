const mongoose = require('mongoose');

const URI = process.env.DATABASE_KEY;

const connectDB = async () =>{
    try{
        await mongoose.connect(URI);
        console.log('Database connection successful');
    }catch(err){
        console.log('Database connection failed.');
        process.exit();
    }
}

module.exports = connectDB;
const mongoose = require('mongoose');
const fs = require('fs');

const Schema = mongoose.Schema;

const moviesSchema = new Schema({
    name :{
        type: String,
        required: [true, 'Name feild is required!'],
        unique: true,
        min: [4, 'Name must be greater than 4 character'],
        max: [100, 'Name must be less than 100 character']
        
    },
    releasedYear:{
        type: Number,
        required: [true, 'Release year field is required!']
    },
    ReleasedDate:{
        type: String,
        required: [true, 'Released date fields is required!']
    },
    duration:{
        type: Number,
        required: [true, 'Duration field is required!']
    },
    description:{
        type: String,
        require: [true, 'Description feild is required!']
    },
    rating:{
        type: Number,
        min: [1, "Rating must be 1.0 or above."],
        max: [10, "Rating must be 10 or below."]
    },
    createdAt:{
        type: Date,
        default: Date.now()
    },
    genres:{
        type: [String],
        required: [true, 'Genres feild is required!']
    },
    directors:{
        type: [String],
        required: [true, 'Directors feild is required!']
    },
    writers:{
        type: [String],
        required: [true, 'Writers feild is required!']
    },
    actors:{
        type: [String],
        required: [true, 'Actors feild is required!']
    },
    poster:{
        type: String
    },
    price:{
        type: Number
    },
    createdBy: String
});

moviesSchema.pre('save', function(next){
    this.createdBy = "SANJU";

    next();
});

moviesSchema.post('save', function(doc, next){
    const content = `A new movie with name ${doc.name} has been created by ${doc.createdBy}\n`;
    fs.writeFileSync('./Log/log.txt', content, {flag: 'a'}, (err) => {
        console.log(err.message);
    });

    next();
});

// moviesSchema.pre(/^find/, function(next){
//     this.find({ReleasedDate: {$lte: Date.now()}});
//     next();
// });

module.exports = Movie = mongoose.model('movies', moviesSchema);
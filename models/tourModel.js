const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

// CREATING A SCHEMA
const tourSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Tour name is required"],
        unique:true,
        trim:true,
        maxlength: [40, 'A tour name must not be greater than 40 characters'],
        minlength: [10, 'A tour name must be atleast 10 characters']
        // VALIDATOR, To check if a string contains only letters without spaces and other characters
        // validate:[validator.isAlpha, 'Tour name Must be alpanumeric']
        
    }, 
    ratingsAverage:{
        type: Number,
        default:4.5,
        min:[1, 'Rating must be atleast 1.0'],
        max:[5, 'Rating must not be greater than 5']
    },
    ratingsQuantity:{
        type: Number,
        default:0
    },
    duration:{
        type: Number,
        required:[true, 'Duration is required']
    },
    maxGroupSize:{
        type: Number,
        required:[true, 'Group Size is required']
    },
    difficulty:{
        type: String,
        required:[true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty should either easy, medium, or Difficult'
        }
    },
    price:{
        type:Number,
        required: [true, "Tour price is required"]
    },
    priceDiscount: {
        type:Number,
        validate:{
            validator:function(val){
                // "This" here only work with new document on creation, it doesn't work on update
                return val < this.price;
            },
            message: 'Discount price (${VALUE}) should be below regular price'
        }
    },
    summary:{
        type: String,
        trim: true,
        required:[true, "A Tour must have a summary"]
    },
    description:{
        type:String,
        trim:true
    },
    imageCover:{
        type:String,
        required:[true, "An image cover is required"]
    },
    images:[String],
    createdAt:{
        type:Date,
        default:Date.now(),
        // the line of code below hides "createdAt" field from the query report by default
        select:false
    },
    startDates:[Date],
    secretTour:{
        type: Boolean,
        default: false
    }
},

// For the virtual proper to show as part of the schema, eventhough it is not
{
    toJSON:{virtuals: true},
    toObject:{virtuals: true}
});

// VIRTUAL PROPERTY - 'durationInWeek' functions like a collection object, but not stored in the database, not that the 'duration' is from the collection(Schema).
tourSchema.virtual('durationInWeek').get(function(){
    return this.duration / 7;
});


// MONGOOSE MIDDLEWARE
// Document Middleware(pre $ post), Otherwise called hook
// Using "this" accesses this current document.
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    console.log(this.slug);
    next();
});

// Pre hook, shows will can use more than one pre hook or post hook on one document
tourSchema.pre('save', function(next) {
    console.log('Will save document....');
    next();
});

// post Hook
tourSchema.post('save', function(next) {
    console.log(this);
    next();
});


// QUERY MIDDLEWARE == Query that runs before or after a query
// NOte the regular expression that check if find is present in the query
tourSchema.pre(/^find/, function(next){
// tourSchema.pre('find', function(next){
 this.find({secretTour:{$ne:true}});
    next();
})

// QUERY MIDDLEWARE == post hook
tourSchema.post(/^find/, function(docs, next){
    console.log(this);
    console.log(`I found this : ${docs.name}`);
    next();
})

// AGGREGATION MIDDLEWARE
 tourSchema.pre('aggregate', function(next){
  this.pipeline().unshift({$match: {secretTour:{$ne:true}}});
    next();
 })

// creating a model from the schema
// "this" refers to the query, "docs" refers to the result of the query in post hook
const Tour = mongoose.model('Tours', tourSchema);
module.exports = Tour;
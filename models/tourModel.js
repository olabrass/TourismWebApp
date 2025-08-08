const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
//const User = require('./userModel'); // Importing the User model to use in the tourSchema

// CREATING A SCHEMA(Schema type object)
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
    slug: {
        type: String,
        unique: true
    },
    ratingsAverage:{
        type: Number,
        default:4.5,
        min:[1, 'Rating must be atleast 1.0'],
        max:[5, 'Rating must not be greater than 5'],
        set: val => Math.round(val * 10) / 10 // This will round the value to one decimal place
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
    },
    startLocation:{
        // GeoJSON (GeoSpartial Data)
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],

    // Embedding guides, this is not the best way to do it, but it is used for learning purposes
   // guides:Array,

   //referencing guides on User document
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ],

    review: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'review'
        }
    ],

},

// For the virtual property to show as part of the schema, eventhough it is not
{
    toJSON:{virtuals: true},
    toObject:{virtuals: true}
});


tourSchema.index({price:1, ratingsAverage:-1}); // Compound index, to sort by price and ratingsAverage for better performance(faster querying)
tourSchema.index({slug:1});
// Geospatial index for the startLocation field, to query by distance
// tourSchema.index({startLocation: '2dsphere'}); // 2dsphere index
// Geospatial index for the locations field, to query by distance
tourSchema.index({startLocation: '2dsphere'}); // 2dsphere index




// VIRTUAL PROPERTY - 'durationInWeek' functions like a collection object, but not stored in the database, not that the 'duration' is from the collection(Schema).
tourSchema.virtual('durationInWeek').get(function(){
    return this.duration / 7;
});

// VIRTUAL POPULATE
// This is used to populate the reviews field in the Tour model, it is not stored in the database, but it is used to get the reviews for a tour when querying the Tour model.
// This is a virtual property, it does not exist in the database, but it is used
tourSchema.virtual('reviews', {
    ref:'review',
    foreignField:'tour', //"tour" is the field in the Review model that references the Tour model(it stores the Tour ID)
    localField:'_id' // "_id" is the field in the Tour model that is referenced by the Review model
});


// MONGOOSE MIDDLEWARE
// Document Middleware(pre $ post), Otherwise called hook
// Using "this" accesses this current document.
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    console.log(this.slug);
    next();
});

// Pre hook to populate the guides field with User documents(Embeded reference)
// tourSchema.pre('save', async function(next) {
//     const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//     this.guides = await Promise.all(guidesPromises);
//     // this.guides = guidesPromises;
//     // console.log(this.guides);
//     next();
// });


// Pre hook, shows will can use more than one pre hook or post hook on one document
tourSchema.pre('save', function(next) {
    console.log('Will save document....');
    next();
});

// Pre hook to populate the guides field with User documents(Reference)
// Note that this is a query middleware, it runs before any query that starts with 'find
tourSchema.pre(/^find/, function(next) {
    this.populate({
            path:'guides',
            select:'-__v -passwordChagedAt' //Exclude __v and passwordChangedAt from the query
            })
     next();
        });

// post Hook
tourSchema.post('save', function(next) {
    console.log(this);
    
});


// QUERY MIDDLEWARE == Query that runs before or after a query
// NOte the regular expression that check if find is present in the query
tourSchema.pre(/^find/, function(next){
// tourSchema.pre('find', function(next){
 this.find({secretTour:{$ne:true}});
    next();
})

// QUERY MIDDLEWARE == post hook
// tourSchema.post(/^find/, function(docs, next){
//     console.log(this);
//     console.log(`I found this : ${docs.name}`);
//     next();
// })

// AGGREGATION MIDDLEWARE
//  tourSchema.pre('aggregate', function(next){
//   this.pipeline().unshift({$match: {secretTour:{$ne:true}}});
//     next();
//  })

// creating a model from the schema
// "this" refers to the query, "docs" refers to the result of the query in post hook
const Tour = mongoose.model('Tours', tourSchema);
module.exports = Tour;
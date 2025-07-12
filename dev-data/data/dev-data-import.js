const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour =  require('./../../models/tourModel');
const User =  require('./../../models/userModel');
const Review =  require('./../../models/reviewModel');

dotenv.config({path: './config.env'});

// database connection
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD).replace('<DATABASE>', process.env.DATABASE_NAME);
mongoose.connect(DB).then(con =>{
    console.log(con.connection);
    console.log('DB connected successfully');
}).catch((error) => console.error('Error connecting to MongoDB:', error));
const port = process.env.PORT || 3000; 

//  READ JSON FILE TO IMPORT TO DATABASE
// JSON.parse converts from JSON object to Javascript object
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));
//const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

// IMPORT DATA INTO DB
// use the command below to import or delete data 
// node dev-data/data/dev-data-import.js --import
// node dev-data/data/dev-data-import.js --delete
const importData = async()=>{
    try{
 await Tour.create(tours);
 await User.create(users, {validateBeforeSave: false});
 await Review.create(reviews);
 console.log('Data successfuly loaded');
    }catch(err){
        console.log(err);
        process.exit(1);
    }

}

// DELETE DATA
const deleteData = async()=>{
 try{
    await Tour.deleteMany();
    await Review.deleteMany();
    await User.deleteMany();
    console.log('All data deleted successfuly');
 }catch(err){
    console.log(err);
    process.exit();
 }




}
if(process.argv[2] === '--import'){
    importData();
}else if(process.argv[2] === '--delete'){
    deleteData();
}
// console.log(process.argv);
const mongoose = require('mongoose');
const app = require('./app');
const dotenv = require('dotenv');

dotenv.config({path: './config.env'});

// Handling Uncaught Exception, error from synchronous code
process.on('uncaughtException', err => {
    console.log('Uncaught Exception! Shutting down...');
    console.log(err.name, err.message);
        process.exit(1);
});
    

// database connection
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD).replace('<DATABASE>', process.env.DATABASE_NAME);
mongoose.connect(DB).then(con =>{
    console.log(con.connection);
    console.log('DB connected successfully');
    
});
const port = process.env.PORT || 3000; 


// Environment Variable
// console.log(app.get('env')); 
//  console.log(process.env);


// CREATING SERVER 
const server = app.listen(port, () => {
    console.log(`App runing on port ${port}`);
    });

    // Handling Unhandled Rejection, error from promise rejection (Asyncronous code)
    process.on('unhandledRejection', err => {
        console.log('Unhandled Rejection! Shutting down...');
        console.log(err.name, err.message);
        server.close(() => {
            process.exit(1);
        });
    });

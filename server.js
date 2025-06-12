const mongoose = require('mongoose');
const app = require('./app');
const dotenv = require('dotenv');

dotenv.config({path: './config.env'});

// database connection
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD).replace('<DATABASE>', process.env.DATABASE_NAME);
mongoose.connect(DB).then(con =>{
    console.log(con.connection);
    console.log('DB connected successfully');
}).catch((error) => console.error('Error connecting to MongoDB:', error));
const port = process.env.PORT || 3000; 

// Environment Variable
// console.log(app.get('env')); 
//  console.log(process.env);


// CREATING SERVER 
app.listen(port, () => {
    console.log(`App runing on port ${port}`);
    })


    
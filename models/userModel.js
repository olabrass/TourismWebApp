const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, 'Name is Required'],
    },
    email:{
        type: String,
        unique:[true, 'Email already exists'],
        validate:[validator.isEmail, 'Enter a valid email address'],
        lowercase:true
    },
    photo:{
        type:string
    },
    password:{
        type:String,
        required:[true, 'Please provide a password'],
        minlength:8
    },
    passwordConfirm:{
        type:String,
        required:[true, 'Please enter a value']
    }
})

const User = mongoose.model('User', userSchema);
module.exports = User;
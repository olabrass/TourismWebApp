const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');


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
        type:String
    },
    password:{
        type:String,
        required:[true, 'Please provide a password'],
        minlength:8, 
        select:false
    },
    passwordConfirm:{
        type:String,
        required:[true, 'Please enter a value'],
        validate:{
            validator: function(el){
                // This only works on CREATE and SAVE
                return el === this.password;
            },
            message: 'Passwords are not the same'
        }
    }
}); 
userSchema.pre("save", async function(next){
    // Only run this function if password was actually modified
    if(!this.isModified('password')) return next();

    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

// Instance method to check if the provided password matches the stored password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
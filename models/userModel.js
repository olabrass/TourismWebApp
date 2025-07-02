const crypto = require('crypto'); //Node build-in module
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

    role:{
        type:String,
        enum:['user', 'guide', 'lead-guide', 'admin'],
        default:'user'
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
    },

    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active:{
        type:Boolean,
        default:true,
        select:false
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

userSchema.pre('save', function(next){
    // Only run this function if password was modified or if the document is new
    // This is to ensure that the passwordChangedAt field is only set when the password is changed
    // and not when the document is created for the first time
    if(!this.isModified('password') || this.isNew) return next();

    // Set the passwordChangedAt field to the current time
    this.passwordChangedAt = Date.now() - 1000; // Subtracting 1000ms to ensure it is before the JWT issued time
    next();
})

// Instance method to check if the provided password matches the stored password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check if the password was changed after the JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    // False means NOT changed
    return false;
};

// Instance method to create a password reset token
userSchema.methods.createPasswordResetToken = function() {
    // Create a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash the token and set it to the passwordResetToken field
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Set the passwordResetExpires field to 10 minutes from now
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    return resetToken;
};

//Query middleware
userSchema.pre(/^find/, function(next) {
    // This will exclude all users that are not active
    this.find({ active:{$ne:false}});
    next();
});

// Create the User model from the schema
const User = mongoose.model('User', userSchema);
module.exports = User;
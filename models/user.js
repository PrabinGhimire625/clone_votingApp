const mongoose = require('mongoose');
const bcrypt=require('bcrypt'); //hashing password

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    email: { type: String },
    password: { type: String, required: true },
    mobile: { type: String },
    address: { type: String, required: true },
    citizenshipNumber: { type: String, required: true, unique: true },
    role: { type: String, enum: ['voter', 'admin'], default: 'voter' },
    isVoted: { type: Boolean, default: false }
});

//for hashing password
userSchema.pre('save',async function(next){
    const User=this;
    //hash the password only if it has been modified (or is new)
    if(!User.isModified('password')) return next()
    try{
        //hash password generation
        const salt=await bcrypt.genSalt(5);
        const hashedPassword= await bcrypt.hash(User.password, salt)   //hash password+salt
        User.password=hashedPassword;
        next();
    }catch(err){
        return next(err);
    }
})

//compared hashed password function
userSchema.methods.comparePassword=async function(candidatePassword){
    try{
        //use bcrypt to compare the provided password with the hashed password
        const isMatch=await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    }catch(err){
        throw err;
    }
}

const user = mongoose.model('user', userSchema);
module.exports = user;

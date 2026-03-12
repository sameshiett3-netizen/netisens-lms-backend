const mongoose = require ('mongoose');
//define the schema
const userSchema =new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        default:'student',
    }

}, {timestamps : true})
//2 Build the model and export it
module.exports = mongoose.model('User',userSchema) 
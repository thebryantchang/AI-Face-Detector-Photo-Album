import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
    url:{type:String,required:true, unique:true},
    categories:{type:[String],required:true},
    uploadedAt:{type:Date,default:Date.now}
})

const Image = mongoose.model('Image',imageSchema)

export default Image
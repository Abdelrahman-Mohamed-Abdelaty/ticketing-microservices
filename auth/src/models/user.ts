import mongoose from "mongoose";
import {Password} from "../services/password";

// required to create a new user
interface UserAtrrs{
    email:string;
    password:string;
}

//interface for properties of a user model
interface UserModel extends mongoose.Model<UserDoc>{
    build(attrs:UserAtrrs):UserDoc;
}

//interface for properties of a user document
interface UserDoc extends mongoose.Document{
    email:string;
    password:string;
}
const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:4,
        maxlength:20
    }
},{
    toJSON:{
        transform(doc,ret){
            ret.id = ret._id;
            delete ret._id;
            delete ret.password;
            delete ret.__v;
        }
    }
});

userSchema.pre<UserDoc>('save',async function(done){
    if(this.isModified('password')){
        this.password = await Password.toHash(this.password);
    }
    done();
});

userSchema.statics.build = (attrs:UserAtrrs)=>{
    return new User(attrs);
}
const User = mongoose.model<UserDoc,UserModel>("User",userSchema);

export {User}


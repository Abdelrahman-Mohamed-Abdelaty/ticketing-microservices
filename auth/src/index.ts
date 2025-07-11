import mongoose from "mongoose";
import {app} from "./app";

const start = async () => {
    console.log('Starting Server.....')
    if(!process.env.JWT_KEY){
        throw new Error('JWT_KEY must be defined')
    }
    if(!process.env.MONGO_URI){
        throw new Error('MONGO_URI must be defined')
    }
    try{
        await mongoose.connect(process.env.MONGO_URI!,{
        })
        console.log('Connected to mongo')
    }catch(error){
        console.error(error)
    }

}
app.listen(3000, () => {
    console.log('Server is running on port 3000')
})

start();

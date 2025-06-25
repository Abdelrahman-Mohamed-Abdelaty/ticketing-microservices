import {MongoMemoryServer} from 'mongodb-memory-server'
import mongoose from 'mongoose'
import {sign} from "jsonwebtoken";
let mongoServer:MongoMemoryServer;

declare global {
    var signin: () => string[];
}

global.signin =  ()=>{
    const payload = {
        id:new mongoose.Types.ObjectId().toHexString(),
        email:'test@test.com',
    };
    const token = sign(payload, process.env.JWT_KEY!);
    const session = {jwt:token};
    const base64 = Buffer.from(JSON.stringify(session)).toString('base64');
    return [`session=${base64}`];
}
jest.mock('../nats-wrapper')

beforeAll(async() => {
    process.env.JWT_KEY = 'test';
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, {});
})

beforeEach(async() => {
    jest.clearAllMocks();
    if(mongoose.connection.db){
        const collections = await mongoose.connection.db!.collections();
        for(let collection of collections){
            await collection.deleteMany({});
        }
    }
})

afterAll(async() => {
    await mongoServer.stop();
    await mongoose.connection.close();
})

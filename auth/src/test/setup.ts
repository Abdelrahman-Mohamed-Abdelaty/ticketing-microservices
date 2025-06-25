import {MongoMemoryServer} from 'mongodb-memory-server'
import mongoose from 'mongoose'
import {app} from "../app";
import request from "supertest";
let mongoServer:MongoMemoryServer;

declare global {
    var signin: () => Promise<string[]>;
}

global.signin = async ()=>{
    const email = 'test@test.com'
    const password = 'password'
    const response = await request(app)
    .post('/api/users/signup')
    .send({
        email,
        password,
    })
    .expect(201);
    const cookie = response.get("Set-Cookie");
    if (!cookie) {
        throw new Error("Expected cookie but got undefined.");
    }
    return cookie;
}
beforeAll(async() => {
    process.env.JWT_KEY = 'test';
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, {});
})

beforeEach(async() => {
    const collections = await mongoose.connection.db!.collections();
    for(let collection of collections){
        await collection.deleteMany({});
    }
})

afterAll(async() => {
    await mongoServer.stop();
    await mongoose.connection.close();
})

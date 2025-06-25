import {app} from "../../app";
import request from "supertest";
import mongoose from "mongoose";

it('returns a 404 if the ticket does not exist',async () =>{
    const id = new mongoose.Types.ObjectId().toHexString();

    await request(app)
        .get(`/api/tickets/${id}`)
        .send({})
        .expect(404);
})


it('returns the ticket if the ticket exists',async () =>{
    const title = 'test';
    const price = 10;

    const res = await request(app)
        .post('/api/tickets')
        .set('Cookie',signin())
        .send({title,price})
        .expect(201);
    const ticketResponse = await request(app)
        .get(`/api/tickets/${res.body.id}`)
        .send()
        .expect(200);

    expect(ticketResponse.body.title).toEqual(title);
    expect(ticketResponse.body.price).toEqual(price);
})
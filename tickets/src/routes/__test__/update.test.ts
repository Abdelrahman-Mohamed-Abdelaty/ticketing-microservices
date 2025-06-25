import request from 'supertest'
import {app} from '../../app'
import mongoose from "mongoose";
import {natsWrapper} from "../../nats-wrapper";
import {Ticket} from "../../models/ticket";


it('return a 404 if the ticket does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({title:'test',price:10})
        .set('Cookie',signin())
        .expect(404);
})
it('return 401 if user not signed in', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({title:'test',price:10})
        .expect(401);
})
it('return a 401 if ticket not belonging to the user', async () => {
    const res = await request(app)
        .post(`/api/tickets/`)
        .send({title:'test',price:10})
        .set('Cookie',signin())
        .expect(201);

    await request(app)
        .put(`/api/tickets/${res.body.id}`)
        .send({title:'test',price:10})
        .set('Cookie',signin())
        .expect(401);
})

it('return a 400 if the ticket title or price are not valid', async () => {
    const res = await request(app)
        .post(`/api/tickets/`)
        .send({title:'test',price:10})
        .set('Cookie',signin())
        .expect(201);

    await request(app)
        .put(`/api/tickets/${res.body.id}`)
        .send({title:'test',price:-10})
        .set('Cookie',signin())
        .expect(400);

    await request(app)
        .put(`/api/tickets/${res.body.id}`)
        .send({title:'',price:10})
        .set('Cookie',signin())
        .expect(400);

})
it('return a 200 if the ticket updated', async () => {
    const cookie = signin();
    const res = await request(app)
        .post(`/api/tickets/`)
        .send({title:'test',price:10})
        .set('Cookie',cookie)
        .expect(201);

    await request(app)
        .put(`/api/tickets/${res.body.id}`)
        .send({title:'updated',price:100})
        .set('Cookie',cookie)
        .expect(200);

    const updatedTicketRes = await request(app)
        .get(`/api/tickets/${res.body.id}`)
        .send()
        .expect(200);
    expect(updatedTicketRes.body.title).toEqual('updated');
    expect(updatedTicketRes.body.price).toEqual(100);

})
it("should publish an event", async () => {
    const cookie = signin();
    const res = await request(app)
        .post(`/api/tickets/`)
        .send({title:'test',price:10})
        .set('Cookie',cookie)
        .expect(201);

    await request(app)
        .put(`/api/tickets/${res.body.id}`)
        .send({title:'updated',price:100})
        .set('Cookie',cookie)
        .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
})

it('rejects updates if the ticket is reserved', async () => {
    const cookie = signin();
    const res = await request(app)
        .post(`/api/tickets/`)
        .send({title: 'test', price: 10})
        .set('Cookie', cookie)
        .expect(201);

    const ticket = await Ticket.findById(res.body.id);
    ticket!.set({orderId: new mongoose.Types.ObjectId().toHexString()});
    await ticket!.save();

    await request(app)
        .put(`/api/tickets/${res.body.id}`)
        .set('Cookie', cookie)
        .send({title: 'updated', price: 100})
        .expect(400);
});

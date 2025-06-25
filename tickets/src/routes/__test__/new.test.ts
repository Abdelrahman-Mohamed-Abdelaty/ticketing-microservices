import request from 'supertest'
import {app} from '../../app'
import {Ticket} from "../../models/ticket";
import {natsWrapper} from "../../nats-wrapper";

it('should has a route handler listening to /api/tickets for post requests \\api\\tickets', async () => {
    const res = await request(app)
        .post('/api/tickets')
        .send({});
    expect(res.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
    const cookie = signin();
    const res = await request(app)
        .post('/api/tickets')
        .send({})
    .set('Cookie',cookie);
    expect(res.status).not.toEqual(401);
});

it('returns a status rather than 401  when signed in', async () => {
    const res = await request(app)
        .post('/api/tickets')
        .send({})
    expect(res.status).toEqual(401);
})

it('returns an error if an invalid title is provided', async () => {
    const cookie = signin();
    await request(app)
    .post('/api/tickets')
    .send({title:'',price:10})
    .set('Cookie',cookie)
    .expect(400);

    await request(app)
        .post('/api/tickets')
        .send({price:10})
        .set('Cookie',cookie)
        .expect(400);
})
it('returns an error if an invalid price is provided', async () => {
    const cookie = signin();
    await request(app)
        .post('/api/tickets')
        .send({title:'test',price:-10})
        .set('Cookie',cookie)
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .send({title:"test"})
        .set('Cookie',cookie)
        .expect(400);
})
it('should be able to create a new ticket', async () => {
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    const title = 'test';
    await request(app)
        .post('/api/tickets')
        .send({title,price:10})
        .set('Cookie',signin())
        .expect(201);

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    expect(tickets[0].title).toEqual(title);

})

it("should publish an event", async () => {

    const title = 'test';
    await request(app)
        .post('/api/tickets')
        .send({title,price:10})
        .set('Cookie',signin())
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
})
import request from 'supertest';
import {app} from '../../app';
import mongoose from 'mongoose';
import {Order} from '../../models/order';
import {Ticket} from '../../models/ticket';
import {natsWrapper} from '../../nats-wrapper';
import {OrderStatus} from "@ticketing-org-dev/common";

it('returns an error if the ticket does not exist', async () => {
    const ticketId = new mongoose.Types.ObjectId();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId})
        .expect(404);
});

it('returns an error if the ticket is already reserved', async () => {
    const ticket = Ticket.build({
        id:new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20,
    });
    await ticket.save();
    const order = Order.build({
        ticket,
        userId: 'randomuserid',
        status: OrderStatus.Created,
        expiresAt: new Date(),
    });
    await order.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId: ticket.id})
        .expect(400);
});

it('reserves a ticket', async () => {
    const ticket = Ticket.build({
        id:new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20,
    });
    await ticket.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId: ticket.id})
        .expect(201);
});

it('returns an error if an invalid ticketId is provided', async () => {
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId: 'invalid-id'})
        .expect(400);
});

it('returns an error if not authenticated', async () => {
    await request(app)
        .post('/api/orders')
        .send({})
        .expect(401);
});

it('emit an order created event',async ()=>{
    const ticket = Ticket.build({
        id:new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20,
    });
    await ticket.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ticketId: ticket.id})
        .expect(201);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
})
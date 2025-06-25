import request from 'supertest';
import {app} from '../../app';
import {Ticket} from '../../models/ticket';
import {Order} from '../../models/order';
import {OrderStatus} from "@ticketing-org-dev/common";
import {natsWrapper} from "../../nats-wrapper";
import mongoose from "mongoose";

it('marks an order as cancelled', async () => {
    // create a ticket
    const ticket = await Ticket.build({
        title: 'concert',
        price: 20,
        id:new mongoose.Types.ObjectId().toHexString()
    }).save();

    const user = global.signin();
    // create an order
    const {body: order} = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ticketId: ticket.id})
        .expect(201);

    // Cancel the order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(204);

    // Expectation to make sure the order is cancelled
    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('returns an error if one user tries to delete another users order', async () => {
    // create a ticket
    const ticket = await Ticket.build({
        id:new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20,
    }).save();

    const user = global.signin();
    // create an order
    const {body: order} = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ticketId: ticket.id})
        .expect(201);

    // try to cancel the order with different user
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', global.signin())
        .send()
        .expect(401);
});

it('emit an order cancelled event',async ()=>{
    // create a ticket
    const ticket = await Ticket.build({
        id:new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20,
    }).save();

    const user = global.signin();
    // create an order
    const {body: order} = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ticketId: ticket.id})
        .expect(201);

    // Cancel the order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(204);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
})
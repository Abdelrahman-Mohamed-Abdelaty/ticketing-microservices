import {Message} from 'node-nats-streaming';
import mongoose from 'mongoose';
import {OrderCreatedEvent, OrderStatus} from '@ticketing-org-dev/common';
import {OrderCreatedListener} from '../order-created-listener';
import {natsWrapper} from '../../../nats-wrapper';
import {Order} from '../../../models/order';


const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: 'alskdfj',
        expiresAt: 'alskdjf',
        ticket: {
            id: 'asdf',
            price: 99,
        },
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return {listener, data, msg};
};

it('replicates the order', async () => {
    const {listener, data, msg} = await setup();

    await listener.onMessage(data, msg);

    const order = await Order.findById(data.id);

    expect(order!.price).toEqual(data.ticket.price);
});

it('acks the message', async () => {
    const {listener, data, msg} = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

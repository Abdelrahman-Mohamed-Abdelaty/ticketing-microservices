import {ExpirationCompleteEvent, OrderStatus} from '@ticketing-org-dev/common';
import mongoose from 'mongoose';
import {Message} from 'node-nats-streaming';
import {Order} from '../../../models/order';
import {Ticket} from '../../../models/ticket';
import {natsWrapper} from '../../../nats-wrapper';
import {ExpirationCompletedListener} from "../expiration-completed-listener";


const setup = async () => {
    const listener = new ExpirationCompletedListener(natsWrapper.client);

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });
    await ticket.save();

    const order = Order.build({
        status: OrderStatus.Created,
        userId: 'asdf',
        expiresAt: new Date(),
        ticket,
    });
    await order.save();

    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return {listener, order, ticket, data, msg};
};

describe('ExpirationComplete Listener', () => {
    it('updates the order status to cancelled', async () => {
        const {listener, order, data, msg} = await setup();

        await listener.onMessage(data, msg);

        const updatedOrder = await Order.findById(order.id);
        expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
    });

    it('emit an OrderCancelled event', async () => {
        const {listener, order, data, msg} = await setup();

        await listener.onMessage(data, msg);

        expect(natsWrapper.client.publish).toHaveBeenCalled();

        const eventData = JSON.parse(
            (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
        );
        expect(eventData.id).toEqual(order.id);
    });

    it('acks the message', async () => {
        const {listener, data, msg} = await setup();

        await listener.onMessage(data, msg);

        expect(msg.ack).toHaveBeenCalled();
    });

    it('throws error if order is not found', async () => {
        const {listener, msg} = await setup();

        const data: ExpirationCompleteEvent['data'] = {
            orderId: new mongoose.Types.ObjectId().toHexString()
        };

        await expect(listener.onMessage(data, msg))
            .rejects
            .toThrow('Order not found');
    });
});
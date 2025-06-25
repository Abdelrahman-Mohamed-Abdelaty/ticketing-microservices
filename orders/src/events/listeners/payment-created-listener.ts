import {Listener, Subjects, OrderStatus, PaymentCreatedEvent} from "@ticketing-org-dev/common";
import {Message} from "node-nats-streaming";
import {queueGroupName} from "./queue-group-names";
import {Order} from "../../models/order";

class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
        console.log(`Message received on ${this.subject} \\:${this.queueGroupName}`);
        console.log(data);

        const {id, orderId, stripeId} = data;
        const order = await Order.findById(orderId);

        if (!order) {
            throw new Error('Order not found');
        }

        order.set({status: OrderStatus.Complete});
        await order.save();

        msg.ack();
    }
}

export {PaymentCreatedListener};
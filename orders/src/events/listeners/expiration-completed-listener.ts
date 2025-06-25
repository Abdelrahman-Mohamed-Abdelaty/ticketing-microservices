import {Listener, Subjects, ExpirationCompleteEvent, OrderStatus} from "@ticketing-org-dev/common";
import {Order} from "../../models/order";
import {Message} from "node-nats-streaming";
import {queueGroupName} from "./queue-group-names";
import {OrderCancelledPublisher} from "../publisher/order-cancelled-publisher";

class ExpirationCompletedListener extends Listener<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
    queueGroupName = queueGroupName;

    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
        const order = await Order.findById(data.orderId).populate('ticket');

        if (!order) {
            throw new Error('Order not found');
        }

        if (order.status === OrderStatus.Complete) {
            return msg.ack();
        }

        order.set({
            status: OrderStatus.Cancelled,
        });
        await order.save();

        new OrderCancelledPublisher(this.client).publish(
            {
                id:order.id,
                version:order.version,
                ticket:{
                    id:order.ticket.id
                }
            }
        )
        msg.ack();
    }
}

export {ExpirationCompletedListener};
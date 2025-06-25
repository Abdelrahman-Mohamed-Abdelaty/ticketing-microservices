import {Listener, OrderCreatedEvent, Subjects} from "@ticketing-org-dev/common";
import {queueGroupName} from "./queue-group-name";
import {Message} from "node-nats-streaming";
import {Order} from "../../models/order";

class OrderCreatedListener extends Listener<OrderCreatedEvent>{
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName

    async onMessage(data:OrderCreatedEvent['data'],msg:Message){
        const orderId = data.id;
        const order = Order.build(
            {
                id:data.id,
                version:data.version,
                price:data.ticket.price,
                status:data.status,
                userId:data.userId,
            }
        );
        await order.save();
        msg.ack();
    }
}

export {OrderCreatedListener};

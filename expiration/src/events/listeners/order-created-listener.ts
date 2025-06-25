import {Listener, OrderCreatedEvent, Subjects} from "@ticketing-org-dev/common";
import {Message} from "node-nats-streaming";
import {expirationQueue} from "../../queues/expiration-queue";

class OrderCreatedListener extends Listener<OrderCreatedEvent>{
    readonly subject = Subjects.OrderCreated;
    queueGroupName = 'ticketing-dev-queue';
    async onMessage(data:OrderCreatedEvent['data'],msg:Message){
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
        console.log(`Delaying order ${data.id} for ${delay}ms`);
        await expirationQueue.add(
            {
                orderId:data.id
            },
            {
                delay,
            }

        );

        msg.ack();

    }
}

export {OrderCreatedListener};
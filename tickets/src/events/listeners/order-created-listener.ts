import {Listener,Subjects,OrderCreatedEvent} from "@ticketing-org-dev/common";
import {Message} from "node-nats-streaming";
import {queueGroupName} from "./queue-group-name";
import {Ticket} from "../../models/ticket";
import {TicketUpdatedPublisher} from "../publishers/ticket-updated-publisher";

class OrderCreatedListener extends Listener<OrderCreatedEvent>{
    subject:Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;
    async onMessage(data:OrderCreatedEvent['data'],msg:Message){
        console.log(`Message received on ${this.subject} :${this.queueGroupName}`);
        const ticket = await Ticket.findById(data.ticket.id);
        if(!ticket){
            throw new Error('Ticket not found');
        }
        ticket.set({orderId:data.id});
        await ticket.save();
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version,
            orderId: ticket.orderId
        })
        msg.ack();
    }
}

export {OrderCreatedListener};
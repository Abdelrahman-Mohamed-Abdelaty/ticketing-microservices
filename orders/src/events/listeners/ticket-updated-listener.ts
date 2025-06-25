import {Listener,Subjects,TicketUpdatedEvent} from "@ticketing-org-dev/common";
import {Message} from "node-nats-streaming";
import {queueGroupName} from "./queue-group-names";
import {Ticket} from "../../models/ticket";

class TicketUpdatedListener extends Listener<TicketUpdatedEvent>{
    subject:Subjects.TicketUpdated = Subjects.TicketUpdated;
    queueGroupName = queueGroupName;
    async onMessage(data:TicketUpdatedEvent['data'],msg:Message){
        console.log(`Message received on ${this.subject} with id ${msg.getSequence()}:${this.queueGroupName}`);
        console.log(data);

        const ticket = await Ticket.findByEvent({id:data.id,version:data.version})
        if(!ticket){
            throw new Error('Ticket not found');
        }
        const {title,price} = data;
        ticket.set({title,price});
        await ticket.save();

        msg.ack();
    }
}

export {TicketUpdatedListener};
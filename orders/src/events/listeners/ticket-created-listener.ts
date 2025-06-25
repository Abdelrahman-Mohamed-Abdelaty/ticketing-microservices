import {Listener,Subjects,TicketCreatedEvent} from "@ticketing-org-dev/common";
import {Message} from "node-nats-streaming";
import {queueGroupName} from "./queue-group-names";
import {Ticket} from "../../models/ticket";

class TicketCreatedListener extends Listener<TicketCreatedEvent>{
    subject:Subjects.TicketCreated = Subjects.TicketCreated;
    queueGroupName = queueGroupName;
    async onMessage(data:TicketCreatedEvent['data'],msg:Message){
        console.log(`Message received on ${this.subject} \\:${this.queueGroupName}`);
        console.log(data);

        const {title,price,id} = data;
        const ticket = Ticket.build({id,title,price});
        await ticket.save();

        msg.ack();
    }
}

export {TicketCreatedListener};
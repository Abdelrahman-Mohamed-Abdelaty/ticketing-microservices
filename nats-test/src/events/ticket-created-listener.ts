import {Listener} from "./base-listener";
import {Message} from "node-nats-streaming";
import {TicketCreatedEvent} from "./ticket-created-event";
import {Subjects} from "./subjects";

class TickerCreatedListener extends Listener<TicketCreatedEvent>{
    subject:Subjects.TicketCreated = Subjects.TicketCreated;
    queueGroupName = 'payments-service';
    onMessage(data:TicketCreatedEvent['data'],msg:Message){
        console.log(`Message received on ${this.subject} with id ${msg.getSequence()}:${this.queueGroupName}`);
        console.log(data);
        msg.ack();
    }
}

export {TickerCreatedListener};
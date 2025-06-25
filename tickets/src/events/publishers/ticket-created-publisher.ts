import {Publisher, Subjects, TicketCreatedEvent} from "@ticketing-org-dev/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
    readonly subject = Subjects.TicketCreated;
}

import {Publisher, Subjects, TicketCreatedEvent, TicketUpdatedEvent} from "@ticketing-org-dev/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
    readonly subject = Subjects.TicketUpdated;
}

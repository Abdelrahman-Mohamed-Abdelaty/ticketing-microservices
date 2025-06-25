import {OrderCreatedEvent, Publisher} from "@ticketing-org-dev/common";
import {Subjects} from "@ticketing-org-dev/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>{
    readonly subject= Subjects.OrderCreated;
}
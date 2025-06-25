import {OrderCancelledEvent, Publisher} from "@ticketing-org-dev/common";
import {Subjects} from "@ticketing-org-dev/common";
export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
    readonly subject= Subjects.OrderCancelled;
}
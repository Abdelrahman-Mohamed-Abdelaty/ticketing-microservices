import {Publisher, Subjects, PaymentCreatedEvent} from '@ticketing-org-dev/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
}
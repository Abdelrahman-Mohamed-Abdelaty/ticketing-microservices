import Queue, {QueueOptions} from "bull";
import {ExpirationCompletePublisher} from "../events/publishers/expiration-complete-publisher";
import {natsWrapper} from "../nats-wrapper";
interface Payload {
    orderId: string;
}

const options: QueueOptions = {
    redis: {
        port: 6379,
        host: process.env.REDIS_HOST,
    }
};

const expirationQueue = new Queue<Payload>('expiration-queue', options);
expirationQueue.process(async (job) => {
    console.log(`Processing job ${job.id},order: ${job.data.orderId}`);
    new ExpirationCompletePublisher(natsWrapper.client).publish({
        orderId: job.data.orderId,
    })
})
export {expirationQueue}
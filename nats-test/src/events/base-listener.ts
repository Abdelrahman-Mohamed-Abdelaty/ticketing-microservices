import {Message, Stan} from "node-nats-streaming";
import {Subjects} from "./subjects";

interface Event {
    subject:Subjects;
    data:any;
}

abstract class Listener<T extends Event> {
    abstract subject:T['subject'];
    abstract queueGroupName:string;
    private client:Stan;
    protected ackWait:number = 5*1000;
    abstract onMessage(data:T['data'],msg:Message):void;

    constructor(client:Stan){
        this.client = client;
    }

    subscriptionOptions(){
        return this.client
            .subscriptionOptions()
            .setDeliverAllAvailable()
            .setManualAckMode(true)
            .setAckWait(this.ackWait)
            .setDurableName(this.queueGroupName);
    }
    listen(){
        const subscription = this.client.subscribe(
            this.subject,
            this.queueGroupName,
            this.subscriptionOptions());
        subscription.on('message',(msg:Message)=>{
            console.log(
                `Message received on ${this.subject} with id ${msg.getSequence()}:${this.queueGroupName}`
            );
            const data = this.parseMessage(msg);
            this.onMessage(data,msg);
        })

    }
    parseMessage(msg:Message){
        return JSON.parse(msg.getData().toString());
    }
}
export {Listener};
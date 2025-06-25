import mongoose from 'mongoose';
import {Order} from "./order";
import {OrderStatus} from "@ticketing-org-dev/common";
import {updateIfCurrentPlugin} from "mongoose-update-if-current";

interface TicketAttrs {
    title: string;
    price: number;
    id:string;
}

export interface TicketDoc extends mongoose.Document{
    title: string;
    price: number;
    version: number;
    isReserved():Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc>{
    build(attrs:TicketAttrs):TicketDoc;
    findByEvent(event: {
        id: string;
        version: number;
    }): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema({
    title: {type:String,required:true,},
    price: {type:Number,required:true,min:0},
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

//for model
ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket(
        {
            _id: attrs.id,
            title: attrs.title,
            price: attrs.price,
        }
    );
}
ticketSchema.statics.findByEvent =  ({id, version})=>{
    return Ticket.findOne({_id: id, version:version - 1});
}


//for doc
ticketSchema.methods.isReserved = async function(){
    const existingOrder = await Order.findOne(
        {ticket:this,
        status:{
            $in:[
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.AwaitingPayment
            ]
        }});
    return !!existingOrder;
}


ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);
const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export {Ticket};
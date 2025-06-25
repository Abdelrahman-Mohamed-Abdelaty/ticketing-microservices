import express,{Request,Response,NextFunction} from 'express'
import {BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest} from "@ticketing-org-dev/common";
import {body} from "express-validator";
import mongoose from "mongoose";
import {Ticket} from "../models/ticket";
import {Order} from "../models/order";
import {natsWrapper} from "../nats-wrapper";
import {OrderCreatedPublisher} from "../events/publisher/order-created-publisher";
const router = express.Router();
const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post('/api/orders',requireAuth,[
    body('ticketId')
        .not()
        .isEmpty()
        .withMessage('Ticket id must be provides')
        .custom((input:string)=>mongoose.Types.ObjectId.isValid(input))
],validateRequest,async (req:Request,res:Response,next:NextFunction)=>{
    const ticketId = req.body.ticketId;
    const userId = req.currentUser!.id;
    const ticket = await Ticket.findById(ticketId);
    if(!ticket){
        return next(new NotFoundError());
    }
    // check if ticket is reserved
    const isReserved = await ticket.isReserved()
    if(isReserved){
        return next(new BadRequestError('Order already exists for this ticket'))
    }
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    const order = Order.build({
        userId,
        status: OrderStatus.Created,
        expiresAt: expiration,
        ticket
    });
    await order.save();
    console.log('order',order);
    new OrderCreatedPublisher(natsWrapper.client).publish({
        id: order.id,
        status: order.status,
        userId: order.userId,
        version: order.version,
        expiresAt: order.expiresAt.toISOString(),
        ticket:{
            id:ticket.id,
            price:ticket.price
        }
    })

    res.status(201).send(order);
})

export {router as newOrderRouter};
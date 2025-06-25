import express, {NextFunction, Request, Response} from "express";
import {
    BadRequestError,
    NotAuthorizedError,
    NotFoundError,
    requireAuth,
    validateRequest
} from "@ticketing-org-dev/common";
import {body} from "express-validator";
import {Ticket} from "../models/ticket";
import {TicketCreatedPublisher} from "../events/publishers/ticket-created-publisher";
import {natsWrapper} from "../nats-wrapper";
import {TicketUpdatedPublisher} from "../events/publishers/ticket-updated-publisher";

const router = express.Router();

router.put('/api/tickets/:id',requireAuth,[
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price').isFloat({gt:0}).withMessage('price must be greater than zero')
],validateRequest,async (req:Request,res:Response,next:NextFunction)=>{
    const {title,price} = req.body;
    const {id} = req.params;
    const ticket = await Ticket.findById(id);
    if(!ticket){
        return next(new NotFoundError())
    }
    if(ticket.userId!=req.currentUser!.id){
        return next(new NotAuthorizedError())
    }
    if(ticket.orderId){
        return next(new BadRequestError('ticket is reserved'));
    }
    ticket.set({title,price});
    await ticket.save();

    new TicketUpdatedPublisher(natsWrapper.client).publish({
        id: ticket.id,
        title:ticket.title,
        price: ticket.price,
        userId: ticket.userId,
        version: ticket.version
    });

    res.status(200).send(ticket);
})

export {router as updateTicketRouter};


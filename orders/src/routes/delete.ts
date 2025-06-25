import express, {NextFunction, Request, Response} from 'express';
import {NotAuthorizedError, NotFoundError, OrderStatus, requireAuth} from '@ticketing-org-dev/common';
import {Order} from '../models/order';
import {OrderCancelledPublisher} from "../events/publisher/order-cancelled-publisher";
import {natsWrapper} from "../nats-wrapper";
const router = express.Router();

router.delete('/api/orders/:orderId', requireAuth, async (req: Request, res: Response,next:NextFunction) => {
    const {orderId} = req.params;

    const order = await Order.findById(orderId).populate('ticket');

    if (!order) {
        return next(new NotFoundError())
    }
    if (order.userId !== req.currentUser!.id) {
        return next(new NotAuthorizedError())
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    new OrderCancelledPublisher(natsWrapper.client).publish({
        id: order.id,
        version: order.version,
        ticket:{
            id:order.ticket.id,
        }
    })
    res.status(204).send(order);
});

export {router as deleteOrderRouter};
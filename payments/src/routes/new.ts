import express, {NextFunction, Request, Response} from 'express';
import {body} from 'express-validator';
import {
    requireAuth,
    validateRequest,
    BadRequestError,
    NotFoundError,
    NotAuthorizedError,
    OrderStatus,
} from '@ticketing-org-dev/common';
import {Order} from '../models/order';
import {stripe} from '../stripe';
import {Payment} from "../models/payment";
import {PaymentCreatedPublisher} from "../events/publishers/payment-created-publisher";
import {natsWrapper} from "../nats-wrapper";



const router = express.Router();

router.post(
    '/api/payments',
    requireAuth,
    [
        body('token').not().isEmpty(),
        body('orderId').not().isEmpty()
    ],
    validateRequest,
    async (req: Request, res: Response,next:NextFunction) => {
        const {token, orderId} = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            return next( new NotFoundError())
        }

        if (order.userId !== req.currentUser!.id) {
            return next( new NotAuthorizedError())
        }

        if (order.status === OrderStatus.Cancelled) {
            return next(new BadRequestError('Cannot pay for a cancelled order'))
        }

        const charge = await stripe.charges.create({
            currency: 'usd',
            amount: order.price * 100,
            source: token,
        });

        const payment = Payment.build({
            orderId,
            stripeId: charge.id,
        });
        await payment.save();

        await new PaymentCreatedPublisher(natsWrapper.client).publish({
            id: payment.id,
            orderId: payment.orderId,
            stripeId: payment.stripeId,
        });

        res.status(201).send({
            id: payment.id,
        });
    }
);

export {router as createChargeRouter};
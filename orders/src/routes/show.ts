import express, {Request, Response,NextFunction} from 'express'
import {NotFoundError, requireAuth, NotAuthorizedError} from '@ticketing-org-dev/common';
import {Order} from '../models/order';

const router = express.Router();

router.get('/api/orders/:id', requireAuth, async (req: Request, res: Response,next:NextFunction) => {
    const order = await Order.findById(req.params.id).populate('ticket');

    if (!order) {
        return next(new NotFoundError())
    }

    if (order.userId !== req.currentUser!.id) {
        return next(new NotAuthorizedError())
    }

    res.send(order);
})

export {router as showOrderRouter};
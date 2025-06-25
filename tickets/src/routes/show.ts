import { Router } from 'express';
import {NotFoundError} from "@ticketing-org-dev/common";
import {Ticket} from "../models/ticket";

const router = Router();
router.get('/api/tickets/:id', async (req, res,next) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
        return next(new NotFoundError())
    }
  res.status(200).send(ticket);
});
export { router as showTicketRouter};
import {createTicketRouter, indexRouter, showTicketRouter} from "./routes";

require('express-async-errors')
import express, {NextFunction,Response,Request} from 'express'
import {json} from 'body-parser'
import {currentUser, errorHandler, NotFoundError} from "@ticketing-org-dev/common";
import cookieSession from "cookie-session";
import {updateTicketRouter} from "./routes/update";
const app = express()

app.set('trust proxy',true);
app.use(json())
app.use(
    cookieSession({
        signed:false,
        secure:process.env.NODE_ENV!=="test",//only send it over https
    })
)

app.use(currentUser)
app.use(createTicketRouter)
app.use(showTicketRouter);
app.use(indexRouter)
app.use(updateTicketRouter);

app.all('*', async(req:Request, res:Response,next:NextFunction) => {
    throw new NotFoundError()
})

app.use(errorHandler);

export {app};
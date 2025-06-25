import {deleteOrderRouter, indexRouter, newOrderRouter, showOrderRouter} from "./routes";

require('express-async-errors')
import express, {NextFunction,Response,Request} from 'express'
import {json} from 'body-parser'
import {currentUser, errorHandler, NotFoundError} from "@ticketing-org-dev/common";
import cookieSession from "cookie-session";
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
app.use(newOrderRouter)
app.use(showOrderRouter);
app.use(deleteOrderRouter);
app.use(indexRouter);

app.all('*', async(req:Request, res:Response,next:NextFunction) => {
    throw new NotFoundError()
})

app.use(errorHandler);

export {app};
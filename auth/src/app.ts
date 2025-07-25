require('express-async-errors')
import express, {NextFunction,Response,Request} from 'express'
import {json} from 'body-parser'
import {currentUserRouter} from "./routes/current-user";
import {signinRouter} from "./routes/signin";
import {signupRouter} from "./routes/signup";
import {signoutRouter} from "./routes/signout";
import {errorHandler,NotFoundError} from "@ticketing-org-dev/common";
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

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signupRouter);
app.use(signoutRouter);

app.all('*', async(req:Request, res:Response,next:NextFunction) => {
    throw new NotFoundError()
})

app.use(errorHandler);

export {app};
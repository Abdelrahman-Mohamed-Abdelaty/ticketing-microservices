import express,{Request,Response} from "express";
import {body, validationResult} from "express-validator";
import {BadRequestError, validateRequest} from "@ticketing-org-dev/common";;
import {User} from "../models";
import {Password} from "../services/password";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post('/api/users/signin',[
    body('email')
        .isEmail()
        .withMessage('Email must be valid'),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('Passwords must be between 4 and 20'),
],validateRequest,async (req:Request,res:Response)=>{
    const {email,password} = req.body;
    const existingUser = await User.findOne({email});
    if (!existingUser){
        throw new BadRequestError("Invalid credentials");
    }
    const passwordsMatch = await Password.compare(existingUser.password,password);
    if(!passwordsMatch){
        throw new BadRequestError("Invalid credentials");
    }
    const jwtToken = jwt.sign({id:existingUser.id,email:existingUser.email},process.env.JWT_KEY!);
    req.session = {jwt:jwtToken};
    res.status(200).send(existingUser);
})

export {router as signinRouter};
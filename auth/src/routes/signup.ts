import express,{Request,Response} from "express";
import {body,validationResult} from "express-validator";
import {BadRequestError, DatabaseConnectionError, RequestValidationError} from "@ticketing-org-dev/common";
import {User} from "../models";
import jwt from "jsonwebtoken";
import {validateRequest} from "@ticketing-org-dev/common";
const router = express.Router();

router.post('/api/users/signup',[
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").trim().isLength({min:4,max:20}).withMessage("Passwords must be between 4 and 20"),
],validateRequest
    ,async (req:Request,res:Response)=>{

    const {email, password} = req.body;
    const existingUser = await User.findOne({email});
    if (existingUser){
        throw new BadRequestError("User already exists");
    }
    const user = User.build({email,password});
    await user.save();
    const jwtToken = jwt.sign({id:user.id,email:user.email},process.env.JWT_KEY!);
    req.session = {jwt:jwtToken};
    res.status(201).send(user);
})

export {router as signupRouter};
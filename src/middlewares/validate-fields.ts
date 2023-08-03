 import { validationResult } from "express-validator";
 import { NextFunction, Request,Response } from "express";

export const validateFields = async (req:Request, res:Response, next:NextFunction):Promise<void | Response> => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors)
    } else{
        next();
        return Promise.resolve();
    }

}
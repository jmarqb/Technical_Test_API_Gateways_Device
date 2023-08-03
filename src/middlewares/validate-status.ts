import { NextFunction, Request, Response } from "express";

export const allowedStatus = ( ...status:string[] )=>{

    return (req:Request, res:Response, next:NextFunction)=>{

        if(req.body.status && !status.includes( req.body.status ) ){
            return res.status(401).json({
                msg:`The service requires one of these status ${ status }`
            });
        }

        next();
    }
}
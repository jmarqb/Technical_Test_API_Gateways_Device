import { Request, Response, NextFunction } from "express";

export const validateUuid = (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const uuidFormat = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

    if (!uuidFormat.test(id)) {
        return res.status(400).send({ message: 'Invalid UUID format' });
    }

    next();
};
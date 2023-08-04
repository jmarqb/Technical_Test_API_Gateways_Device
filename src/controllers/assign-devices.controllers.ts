import { Request, Response } from "express";

import * as mysql2 from "mysql2/promise"
import { connect } from "../database/db.config";

import { insertValueTotalAssociated, isDeviceAssociated, isUid_deviceExists, isUnderDeviceLimit, isUUID_gatewaysExists, updateDeviceAssociation } from "../helpers/db-validators";

export const assignDevice = async (req: Request, res: Response): Promise<Response> => {

    const { gateway_uuid, device_uid } = req.body;

    //validate device_uid exist in db 
    if (!await isUid_deviceExists(device_uid)) {
        return res.status(400).json({ error: 'Device not found' });
    }
    //validate gateway_uuid exist in db
    if (!await isUUID_gatewaysExists(gateway_uuid)) {
        return res.status(400).json({ error: 'Gateway not found' });
    }

    //validate if the device is associated with a device
    if (await isDeviceAssociated(device_uid)) {
        return res.status(400).json({ error: 'The device is already associated with a gateway ' });
    }

    //verify that the gateway has fewer than 10 devices assigned
    if (!await isUnderDeviceLimit(gateway_uuid)) {
        return res.status(400).json({ error: 'The gateway has reached the limits to assignated devices ' });
    }

    const query = `SELECT * FROM gateways WHERE serialnumber = ?`;
    const queryInsert = `INSERT INTO gateway_devices(gateway_id,device_id) VALUES ( ?, ?)`;

    try {

        //Link the UUID to the ID in gateways table
        const cnn = await connect();
        const [row] = await cnn.query(query, [gateway_uuid]) as mysql2.RowDataPacket[];
        const gateway_id = row[0].id; //tengo el id de gateways

        //Make the assignment in the database
        const valuesInsert = [gateway_id, device_uid];
        const [rowI] = await cnn.query(queryInsert, valuesInsert) as mysql2.ResultSetHeader[];

        await insertValueTotalAssociated(gateway_uuid);
        await updateDeviceAssociation(device_uid, gateway_id);

        return res.json({
            device_uid,
            gateway_uuid,
            asignacion: 'Success'
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Something went wrong',
        });
    }

}
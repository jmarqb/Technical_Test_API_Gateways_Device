import { Request, Response } from "express";
import * as mysql2 from 'mysql2/promise';
import { connect } from "../database/db.config";
import { verifyDeviceAssociationBeforeDelete } from "../helpers/db-validators";
import DeviceSchema from "../models/device";

//get devices paginate
export const getDevices = async (req: Request, res: Response): Promise<Response> => {

    let from = Number(req.query.from);
    let limits = Number(req.query.limits);

    if (isNaN(limits)) {
        limits = 5;
    }
    if (isNaN(from)) {
        from = 0
    }

    const query = `SELECT * FROM devices LIMIT ? OFFSET ?`
    const values = [limits, from];


    try {
        const cnn = await connect();
        const [devices] = await cnn.query(query, values) as mysql2.RowDataPacket[];

        // for every device find gateway associated
        for(let i=0 ; i < devices.length ; i++){
            const [gateway] = await cnn.query('SELECT gateways.id, gateways.serialnumber, gateways.name, gateways.ipv4address FROM gateways INNER JOIN gateway_devices ON gateways.id = gateway_devices.gateway_id WHERE gateway_devices.device_id = ?', [devices[i].uid]) as mysql2.RowDataPacket[];
            devices[i].associated_gateway = gateway;
        }

        return res.json({
            total: devices.length,
            devices
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Something goes wrong'
        });
    }

}
//Get device by id
export const getDeviceById = async (req: Request, res: Response): Promise<Response> => {

    const { id } = req.params;
    const query = `SELECT * FROM devices WHERE uid = ?`;
    const values = [id];

    try {
        const cnn = await connect();
        const [devices] = await cnn.query(query, values) as mysql2.RowDataPacket[];

        // for every device find gateway associated
        for(let i=0 ; i < devices.length ; i++){
            const [gateway] = await cnn.query('SELECT gateways.id, gateways.serialnumber, gateways.name, gateways.ipv4address FROM gateways INNER JOIN gateway_devices ON gateways.id = gateway_devices.gateway_id WHERE gateway_devices.device_id = ?', [devices[i].uid]) as mysql2.RowDataPacket[];
            devices[i].associated_gateway = gateway;
        }
        return res.json(devices);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Something goes wrong'
        });
    }

}
//create device
export const createDevice = async (req: Request, res: Response): Promise<Response> => {

    const { vendor } = req.body;

    const device = new DeviceSchema(vendor);

    const query = `INSERT INTO devices(vendor,status) VALUES (?,?)`;
    const values = [device.vendor, device.status];

    try {
        const cnn = await connect();
        const [rows] = await cnn.query(query, values) as mysql2.ResultSetHeader[];
        const id = rows.insertId;

        const [date_created] = await cnn.query('SELECT date_created FROM devices WHERE uid = ?', [id]) as mysql2.RowDataPacket[];
        const dateFormated: string = date_created[0].date_created.toISOString().slice(0, 19);

        return res.json({
            uid: rows.insertId,
            vendor: device.vendor,
            status: device.status,
            date_created: dateFormated, //2023-07-28T22:32:18
            
        });
    } catch (error) {
        console.log(error);
        if ((error as NodeJS.ErrnoException).code === 'ER_BAD_NULL_ERROR') {
            return res.status(400).json({
                msg: `${(error as NodeJS.ErrnoException).message}`
            });
        } else {
            return res.status(500).json({
                msg: 'Something goes wrong'
            });
        }
    }

}
//update device
export const updateDevice = async (req: Request, res: Response): Promise<Response> => {

    const { id } = req.params;
    const { vendor, status } = req.body;

    const query = `UPDATE devices SET vendor=IFNULL(?,vendor),
                   status=IFNULL(?,status)
                   WHERE uid=?`;

    const devolQuery = 'SELECT * FROM devices WHERE uid = ?';
    const values = [vendor, status, id];
    let datecreatedFormated: string;
    let dateupdatedFormated: string;

    try {
        const cnn = await connect();
        const [result] = await cnn.query(query, values) as mysql2.ResultSetHeader[];
        

        if (result.affectedRows <= 0) {
            return res.status(404).json({
                msg: 'Device not found'
            });
        }else{
            const [dateInfo] = await cnn.query('SELECT date_created, date_on_update FROM devices WHERE uid = ?', [id]) as mysql2.RowDataPacket[];
            datecreatedFormated = dateInfo[0].date_created.toISOString();
            dateupdatedFormated = dateInfo[0].date_on_update.toISOString();
        }

        const [rows] = await cnn.query(devolQuery, [id]) as mysql2.RowDataPacket[];
        
        return res.json({
            uid: rows[0].uid,
            vendor: rows[0].vendor,
            status: rows[0].status,
            date_created: datecreatedFormated, 
            date_updated: dateupdatedFormated 
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Something goes wrong'
        });
    }

}

//delete device
export const deleteDevice = async (req: Request, res: Response): Promise<Response> => {

    const { id } = req.params;

    const query = `DELETE FROM devices
                   WHERE uid = ? `;
    const values = [id];

   await verifyDeviceAssociationBeforeDelete(parseInt(id));

    try {
        const cnn = await connect();
        const [result] = await cnn.query(query, values) as mysql2.ResultSetHeader[];

        if (result.affectedRows <= 0) {
            return res.status(404).json({
                msg: 'Device not found'
            });
        }
        return res.send().status(200);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Something goes wrong'
        });
    }

}
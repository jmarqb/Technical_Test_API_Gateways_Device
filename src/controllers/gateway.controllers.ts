import { Request, Response } from "express";
import * as mysql2 from 'mysql2/promise';
import { connect } from "../database/db.config";

import GatewaysSchema from "../models/gateways";
import { isSubnetInUse, verifyGatewayAssociationBeforeDelete } from "../helpers/db-validators";

//get gateways paginate
export const getGateways = async (req: Request, res: Response): Promise<Response> => {

    let from = Number(req.query.from);
    let limits = Number(req.query.limits);

    if (isNaN(limits)) {
        limits = 5;
    }
    if (isNaN(from)) {
        from = 0
    }

    const query = `SELECT * FROM gateways LIMIT ? OFFSET ?`
    const values = [limits, from];


    try {
        const cnn = await connect();
        const [gateways] = await cnn.query(query, values) as mysql2.RowDataPacket[];

        // for every gateway find devices associated
        for (let i = 0; i < gateways.length; i++) {
            const [devices] = await cnn.query('SELECT devices.uid, devices.vendor, devices.status, devices.date_created, devices.date_on_update FROM devices INNER JOIN gateway_devices ON devices.uid = gateway_devices.device_id WHERE gateway_devices.gateway_id = ?', [gateways[i].id]) as mysql2.RowDataPacket[];
            gateways[i].associated_devices = devices;
        }

        return res.json({
            total: gateways.length,
            gateways
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Something goes wrong'
        });
    }

}
export const getGatewaysById = async (req: Request, res: Response): Promise<Response> => {

    const { id } = req.params;
    const query = `SELECT * FROM gateways WHERE serialnumber = ?`;
    const values = [id];

    try {
        const cnn = await connect();
        const [gateways] = await cnn.query(query, values) as mysql2.RowDataPacket[];

       // for every gateway find devices associated
        for (let i = 0; i < gateways.length; i++) {
            const [devices] = await cnn.query('SELECT devices.uid, devices.vendor, devices.status, devices.date_created, devices.date_on_update FROM devices INNER JOIN gateway_devices ON devices.uid = gateway_devices.device_id WHERE gateway_devices.gateway_id = ?', [gateways[i].id]) as mysql2.RowDataPacket[];
            gateways[i].associated_devices = devices;
        }

        return res.json(gateways);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Something goes wrong'
        });
    }

}

export const createGateways = async (req: Request, res: Response): Promise<Response> => {

    const { name, ipv4address } = req.body;

    //validate if subnet is in use in range /24 or /16
    const subnet_24:string = ipv4address.slice(0, ipv4address.lastIndexOf('.'));
    const subnet_16:string = ipv4address.split('.').slice(0, 2).join('.');
    // console.log(subnet_24);
    // console.log(subnet_16);

    if(await isSubnetInUse(subnet_24)){
        return res.status(400).json({ error: 'Subnet is already in use.' });
    }
    if(await isSubnetInUse(subnet_16)){
        return res.status(400).json({ error: 'Subnet is already in use.' });
    }

    const gateway = new GatewaysSchema(name, ipv4address);

    const query = `INSERT INTO gateways(serialnumber,name,ipv4address) VALUES (? , ? , ?)`;
    const values = [gateway.serialId,
    gateway._name,
    gateway.ipv4];

    try {
        const cnn = await connect();
        const [rows] = await cnn.query(query, values) as mysql2.ResultSetHeader[];
        return res.json({
            id: rows.insertId,
            serialnumber: gateway.serialId,
            name: gateway._name,
            ipv4address: gateway.ipv4,
        });
    } catch (error) {
        console.log(error);
       
        return res.status(500).json({
            msg: 'Something goes wrong'
        });

       
    }

}

export const updateGateways = async (req: Request, res: Response): Promise<Response> => {

    const { id } = req.params;
    const { name, ipv4address } = req.body;

    const query = `UPDATE gateways SET name=IFNULL(?,name),
                   ipv4address=IFNULL(?,ipv4address)
                   WHERE serialnumber=?`;

    const devolQuery = 'SELECT * FROM gateways WHERE serialnumber = ?';
    const values = [name, ipv4address, id];

    try {
        const cnn = await connect();
        const [result] = await cnn.query(query, values) as mysql2.ResultSetHeader[];

        if (result.affectedRows <= 0) {
            return res.status(404).json({
                msg: 'Gateway not found'
            });
        }
        
        const [rows] = await cnn.query(devolQuery, [id]) as mysql2.RowDataPacket[];
         // for every gateway find devices associated
         for (let i = 0; i < rows.length; i++) {
            const [devices] = await cnn.query('SELECT devices.uid, devices.vendor, devices.status, devices.date_created, devices.date_on_update FROM devices INNER JOIN gateway_devices ON devices.uid = gateway_devices.device_id WHERE gateway_devices.gateway_id = ?', [rows[i].id]) as mysql2.RowDataPacket[];
            rows[i].associated_devices = devices;
        }
        return res.json(rows);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Something goes wrong'
        });
    }

}
export const deleteGateway = async (req: Request, res: Response): Promise<Response> => {

    const { id } = req.params;

    const query = `DELETE FROM gateways
                   WHERE serialnumber = ? `;
    const values = [id];

    await verifyGatewayAssociationBeforeDelete(id);

    try {
        const cnn = await connect();
        const [result] = await cnn.query(query, values) as mysql2.ResultSetHeader[];

        if (result.affectedRows <= 0) {
            return res.status(404).json({
                msg: 'Gateway not found'
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
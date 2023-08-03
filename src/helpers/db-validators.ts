
import * as mysql2 from 'mysql2/promise';
import { connect } from "../database/db.config";


//validate if exists name in database
export const nameExists = async (name: string): Promise<void> => {

    const query = `SELECT * FROM gateways WHERE name = ?`;
    const values = [name];

    const cnn = await connect();
    const [rows] = await cnn.query(query, values) as mysql2.RowDataPacket[];

    //console.log(rows);
    if (rows.length > 0) {
        throw new Error(`The name ${name} already exists in database`);
    }

}
//validate if exists ip in database
export const ipv4AddressExists = async (ipv4address: string): Promise<void> => {

    const query = `SELECT * FROM gateways WHERE ipv4address = ?`;
    const values = [ipv4address];
    
    const cnn = await connect();
    const [rows] = await cnn.query(query, values) as mysql2.RowDataPacket[];

    //console.log(rows);
    if (rows.length > 0) {
        throw new Error(`The address ${ipv4address} already exists in database`);
    }

}
// validate if subnet is in use 
export const isSubnetInUse = async (subnet: string): Promise<boolean> => {
    const query = `SELECT * FROM gateways WHERE ipv4address LIKE ?`;
    const values = [subnet + '%'];

    try {
        const cnn = await connect();
        const [rows] = await cnn.query(query, values) as mysql2.RowDataPacket[];

    return rows.length > 0;
    } catch (error) {
        console.log(error);
        throw new Error('Something goes wrong');
    }
    
}

//validate is uid_device exists in db_devices
export const isUid_deviceExists = async (uid: number): Promise<boolean> => {
    const query = `SELECT * FROM devices WHERE uid = ?`;
    const value = [uid];

    try {
        const cnn = await connect();
        const [rows] = await cnn.query(query, value) as mysql2.RowDataPacket[];
    
        return rows.length > 0;
    } catch (error) {
        console.log(error);
        throw new Error('Something goes wrong');
    }
   

}
//validate is uuid_gateway exists in db_gateways
export const isUUID_gatewaysExists = async (uuid: string): Promise<boolean> => {
    const query = `SELECT * FROM gateways WHERE serialnumber = ?`;
    const value = [uuid];

    try {
        const cnn = await connect();
        const [rows] = await cnn.query(query, value) as mysql2.RowDataPacket[];
    
        return rows.length > 0;
    } catch (error) {
        console.log(error);
        throw new Error('Something goes wrong');
    }
  
}

//validate if the device is already assigned a gateway
export const isDeviceAssociated = async (uid: number): Promise<boolean> => {
    const query = `SELECT * FROM gateway_devices WHERE device_id = ?`;
    const value = [uid];

    try {
        const cnn = await connect();
        const [rows] = await cnn.query(query, value) as mysql2.RowDataPacket[];

        return rows.length > 0;
    } catch (error) {
        console.log(error);
        throw new Error('Something goes wrong');
    }

}

//validate if gateway have 10 devices assigned
export const isUnderDeviceLimit = async (uuid: string): Promise<boolean> => {
    const query = `SELECT total_devices_associated FROM gateways WHERE serialnumber = ?`;
    const values = [uuid];

    try {

        const cnn = await connect();
        const [row] = await cnn.query(query, values) as mysql2.RowDataPacket[];
        const total_devices = row[0].total_devices_associated;

        return total_devices < 10; //Retorna true si el total de dispositivos es menor a 10, falso en caso contrario
    } catch (error) {
        console.log(error);
        throw new Error('Something goes wrong');
    }

}

//increment in 1 value of total_devices_associated in table gateways
export const insertValueTotalAssociated = async(uuid: string):Promise<void>=>{
    const query = `UPDATE gateways SET total_devices_associated = total_devices_associated + 1
                   WHERE serialnumber = ?`;
    const value = [uuid];
   
    const cnn = await connect();
    const [row] = await cnn.query(query,value) as mysql2.ResultSetHeader[];

    if (row.affectedRows <= 0) {
        throw new Error ('Gateway not found');
    }
}

//updated associated field in devices table
export const updateDeviceAssociation = async(device_uid:number, gatewayID:number):Promise<void>=>{
    const query = `UPDATE devices SET associated = ? 
                   WHERE uid = ?`
    const values = [gatewayID,device_uid];

    const cnn = await connect();
    const [row] = await cnn.query(query,values) as mysql2.ResultSetHeader[];

    if(row.affectedRows <=0){
        throw new Error("Device not found");
        
    }
}

//verificar si el device tiene un gateway asociado y actualizar el campo total_devices_associated
//en la tabla gateways -se utiliza en el deleteDevice
export const verifyDeviceAssociationBeforeDelete = async(uid:number):Promise<void>=>{
    const query = `SELECT gateway_id FROM gateway_devices WHERE device_id = ?`
    const value = [uid];

    const task = `UPDATE gateways SET total_devices_associated = total_devices_associated - 1
                   WHERE id = ?`;

    const cnn = await connect();
    const [row] = await cnn.query(query,value) as mysql2.RowDataPacket[];
    
    if(row.length > 0){
        const gateway_id = row[0].gateway_id;
        const [gateway] = await cnn.query(task,gateway_id) as mysql2.ResultSetHeader[];
       
    }
}

export const verifyGatewayAssociationBeforeDelete = async(uuid:string):Promise<void>=>{
    const query = `SELECT id FROM gateways WHERE serialnumber = ?`;
    const task =`UPDATE devices SET associated = 0 WHERE associated = ?`;
    const value = [uuid];

    const cnn = await connect();
    const [row] = await cnn.query(query,value) as mysql2.RowDataPacket[];

    if(row.length > 0){
        const gateway_id = row[0].id;
        const[device] = await cnn.query(task,gateway_id) as mysql2.ResultSetHeader[]
    }
}


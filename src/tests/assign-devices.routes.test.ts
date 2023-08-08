import request from 'supertest';
import Server from '../models/server';
import { disconnect } from '../database/db.config';
import { createNewDevice, createNewGateway, verifyGatewayStructure } from './test-helpers';

let url: string = '/api/gateways/assignDevice';
let server: Server;

beforeAll(()=>{
    server = new Server()
});
afterAll(async()=>{
    await disconnect();
});

describe('Post /api/gateways/assignDevice',()=>{
  
    let createdDeviceId: any;
    let createdGatewayId: any;
    let arrayOfIdsOfDevicesCreated:number[] = [];
    let arrayOfIdsOfGatewaysCreated:number[] = [];

    afterEach(async () => {
        if (createdDeviceId) {
            await request(server.app).delete(`/api/devices/${createdDeviceId}`);
            createdDeviceId = null;
        }
        if (createdGatewayId) {
            await request(server.app).delete(`/api/gateways/${createdGatewayId}`);
            createdGatewayId = null;
        }
        if(arrayOfIdsOfDevicesCreated.length > 0){
            for(let id of arrayOfIdsOfDevicesCreated){
                await request(server.app).delete(`/api/devices/${id}`);
            }
        }
        if(arrayOfIdsOfGatewaysCreated.length > 0){
            for(let id of arrayOfIdsOfGatewaysCreated){
                await request(server.app).delete(`/api/gateways/${id}`);
            }
        }
        
    });

    test('should respond with a content-type of application/json', async () => {
        const response = await request(server.app).post(url).send();
        expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
    });

    test('Post Assignation Gateway-Devices Success',async()=>{
        //creating a device for use the device_uid
        const respDevice = await createNewDevice();
        createdDeviceId = respDevice.body.uid;

        //creating a gateway for use the gateway_uuid
        const respGateway = await createNewGateway();
        createdGatewayId = respGateway.body.serialnumber;

        const assignation = { gateway_uuid : createdGatewayId, device_uid: createdDeviceId};
        const response = await request(server.app).post(url).send(assignation);
        expect(response.body).toHaveProperty('device_uid');
        expect(response.body).toHaveProperty('gateway_uuid');
        expect(response.body).toHaveProperty('assignation');
        expect(response.body.device_uid).toEqual(createdDeviceId);
        expect(response.body.gateway_uuid).toEqual(createdGatewayId);
        expect(response.statusCode).toBe(200);
         arrayOfIdsOfDevicesCreated.push(createdDeviceId);
        arrayOfIdsOfGatewaysCreated.push(createdGatewayId);
    
    });

    test('should respond with a status 400 if device_id is Invalid Format', async () => {
        //creating a gateway for use the gateway_uuid
        const respGateway = await createNewGateway();
        createdGatewayId = respGateway.body.serialnumber;

        const assignation = { device_uid : 'ffff', gateway_uuid: createdGatewayId }
        const response = await request(server.app).post(url).send(assignation);
        expect(response.statusCode).toBe(400);
        expect(response.body.errors[0].msg).toBe('Invalid value');
    });
    test('should respond with a status 400 if gateway_uuid is Invalid Format', async () => {
        //creating a device for use the device_uid
        const respDevice = await createNewDevice();
        createdDeviceId = respDevice.body.uid;
        arrayOfIdsOfDevicesCreated.push(createdDeviceId);

        const assignation = { device_uid : createdDeviceId, gateway_uuid: 55 }
        const response = await request(server.app).post(url).send(assignation);
        expect(response.statusCode).toBe(400);
        expect(response.body.errors[0].msg).toBe('Invalid value');
    });

    test('should respond with a status 404 if Device not found ', async () => {
        //creating a gateway for use the gateway_uuid
        const respGateway = await createNewGateway();
        createdGatewayId = respGateway.body.serialnumber;
        const assignation = { device_uid : 0 , gateway_uuid: createdGatewayId }

        const response = await request(server.app).post(url).send(assignation);
        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe('Device not found');
    });

    test('should respond with a status 404 if Gateway not found ', async () => {
        //creating a device for use the device_uid
        const respDevice = await createNewDevice();
        createdDeviceId = respDevice.body.uid;
        arrayOfIdsOfDevicesCreated.push(createdDeviceId);
        const assignation = { device_uid:createdDeviceId  , gateway_uuid: '35c73d34-0a97-4d32-a0f2-a6eb4d618f96' }

        const response = await request(server.app).post(url).send(assignation);
        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe('Gateway not found');
    });

    test('should respond with a status 400 is DeviceID or GatewayID is missing',async()=>{
        let response:any;
        //creating a gateway for use the gateway_uuid
        const respGateway = await createNewGateway();
        createdGatewayId = respGateway.body.serialnumber;
        arrayOfIdsOfGatewaysCreated.push(createdGatewayId);

        //creating a device for use the device_uid
        const respDevice = await createNewDevice();
        createdDeviceId = respDevice.body.uid;
        arrayOfIdsOfDevicesCreated.push(createdDeviceId);

        const fields = [
            {},
            {gateway_uuid :createdGatewayId },
            {device_uid   : createdDeviceId }
        ];
        for(let body of fields){
            response = await request(server.app).post(url).send(body);
        }
        expect(response.statusCode).toBe(400);
    });

    test('should respond with a status 400 if the gateway has reached the limits to assignated devices',async()=>{

        //creating a gateway for use the gateway_uuid
        const respGateway = await createNewGateway();
        createdGatewayId = respGateway.body.serialnumber;

        //assignating 10 devices to a gateway
        for(let i = 1 ; i <= 10; i++){
        //creating a device for use the device_uid
         const respDevice = await createNewDevice();
         createdDeviceId = respDevice.body.uid;

        const assignation = { device_uid:createdDeviceId  , gateway_uuid: createdGatewayId }
        await request(server.app).post(url).send(assignation);
        arrayOfIdsOfDevicesCreated.push(createdDeviceId);
        }

        //creating a device for use the device_uid
        const respDevice = await createNewDevice();
        createdDeviceId = respDevice.body.uid;
        arrayOfIdsOfDevicesCreated.push(createdDeviceId);

        //the 11 assignation - to fail
        const assignation = { device_uid:createdDeviceId  , gateway_uuid: createdGatewayId }
        const response = await request(server.app).post(url).send(assignation);
        expect(response.statusCode).toBe(400)
        expect(response.body.error).toBe('The gateway has reached the limits to assignated devices');
    });

    test('should respond a status 400 if The device is already associated with a gateway',async()=>{
        //creating a gateway for use the gateway_uuid for the first assignment - 200
        const respGateway1 = await createNewGateway();
        const createdGatewayId1 = respGateway1.body.serialnumber;
        
        //creating a gateway for use the gateway_uuid for the second assignment - 400
        const respGateway2 = await createNewGateway();
        const createdGatewayId2 = respGateway2.body.serialnumber;

        //creating a device for use the device_uid
        const respDevice = await createNewDevice();
        let createdDeviceId = respDevice.body.uid;
        arrayOfIdsOfDevicesCreated.push(createdDeviceId);
        const assignation1 = { device_uid:createdDeviceId  , gateway_uuid: createdGatewayId1 }
        const response = await request(server.app).post(url).send(assignation1);
        expect(response.statusCode).toBe(200);

        //the second assignment - 400
        const assignation2 = { device_uid:createdDeviceId  , gateway_uuid: createdGatewayId2 }
        const response2 = await request(server.app).post(url).send(assignation2);
        expect(response2.statusCode).toBe(400);
        expect(response2.body.error).toBe('The device is already associated with a gateway');
        arrayOfIdsOfGatewaysCreated.push(createdGatewayId1,createdGatewayId2);
    });
});

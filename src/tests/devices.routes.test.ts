import request from 'supertest';
import Server from '../models/server';
import { disconnect } from '../database/db.config';
import { createNewDevice, verifyDeviceStructure } from './test-helpers';

let url: string = '/api/devices';
let server: Server;

beforeAll(() => {
    server = new Server()
});
afterAll(async () => {
    await disconnect();
});

describe('Get /api/devices',()=>{

    test('should respond with a content-type of application/json', async () => {
        const response = await request(server.app).get(url).send();
        expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
    });

    test('should respond with an array of devices', async () => {
        const response = await request(server.app).get(url).send();
        expect(response.body.devices).toBeInstanceOf(Array);
        expect(response.statusCode).toBe(200);
    });

    test('should respond paginate with query parameters', async () => {
        const response = await request(server.app).get(`${url}?from=0&limits=5`).send()
        expect(response.body.devices.length).toBeLessThanOrEqual(5);
        expect(response.statusCode).toBe(200);
    });

    test('verify the structure of the every device of the list', async () => {
        const response = await request(server.app).get(url).send();
        if (response.body.devices.length > 0) {
            for (let device of response.body.devices) {
                verifyDeviceStructure(device);
            }
        }
        expect(response.statusCode).toBe(200);
    });

    test('should respond with an array of gateways associated to a device', async () => {
        const response = await request(server.app).get(url).send();
        if (response.body.devices.length > 0) {
            for (let device of response.body.devices) {
                expect(device.associated_gateway).toBeInstanceOf(Array);
            }
        }
        expect(response.statusCode).toBe(200);
    });

    test('verify the structure of gateway associated to a device', async () => {
        const response = await request(server.app).get(url).send();
        if (response.body.devices.length > 0) {
            for (let device of response.body.devices) {
                if (device.associated_gateway.length > 0) {
                    for (let gateway of device.associated_gateway) {
                        expect(gateway).toHaveProperty('id');
                        expect(gateway).toHaveProperty('serialnumber');
                        expect(gateway).toHaveProperty('name');
                        expect(gateway).toHaveProperty('ipv4address');
                    }
                }
            }
        }
        expect(response.statusCode).toBe(200);
    });
});

describe('GET /api/devices/:id', () => {
    const id = '40';

    test('should respond with a content-type of application/json', async () => {
        const response = await request(server.app).get(`${url}/${id}`).send();
        expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
        expect(response.statusCode).toBe(200);
    });

    test('should respond with an array', async () => {
        const response = await request(server.app).get(`${url}/${id}`).send();
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });

    test('verify the structure of the device', async () => {
        const response = await request(server.app).get(`${url}/${id}`).send();
        if (response.body.length > 0) {
            const device = response.body[0]
            verifyDeviceStructure(device);
        }
        expect(response.statusCode).toBe(200);
    });

    test('should respond with an array of gateway associated to a device', async () => {
        const response = await request(server.app).get(`${url}/${id}`).send();
        if (response.body.length > 0) {
            for (let device of response.body) {
                expect(device.associated_gateway).toBeInstanceOf(Array);
            }
        }
        expect(response.statusCode).toBe(200);
    });

    test('verify the structure of gateway associated to a device', async () => {
        const response = await request(server.app).get(`${url}/${id}`).send();
        if (response.body.length > 0) {
            for (let device of response.body) {
                if (device.associated_gateway.length > 0) {
                    for (let gateway of device.associated_gateway) {
                        expect(gateway).toHaveProperty('id');
                        expect(gateway).toHaveProperty('serialnumber');
                        expect(gateway).toHaveProperty('name');
                        expect(gateway).toHaveProperty('ipv4address');
                    }
                }
            }
        }
        expect(response.statusCode).toBe(200);
    });

    test('should respond with a status 400 if ID is Invalid Format', async () => {
        const invalidID:string = '20f66fc8-b250-48dc-a0c7-b40e54e045e6';
        const response = await request(server.app).get(`${url}/${invalidID}`).send();
        expect(response.statusCode).toBe(400);
        expect(response.body.errors[0].msg).toBe('ID should be a number');
    });
});

describe('Post /api/devices',()=>{
    let createdDeviceId: any;

    afterEach(async () => {
        if (createdDeviceId) {
            await request(server.app).delete(`/api/devices/${createdDeviceId}`);
            createdDeviceId = null;
        }
    });

    test('POST /api/devices - success', async () => {
        const resp = await createNewDevice();
        verifyDeviceStructure(resp.body);
        expect(resp.body.vendor).toEqual(resp.body.vendor);
        expect(resp.statusCode).toBe(200);
        createdDeviceId = resp.body.uid;
    });

    test('should respond with a content-type of application/json', async () => {
        const response = await request(server.app).post(url).send();
        expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
    });

    test('should respond a status 400 if vendor is missing or is a number',async()=>{
        const fields = [
            {},
            { vendor: "" },
            { vendor: Number }
        ]
        for(const body of fields ){
            const response = await request(server.app).post(url).send();
            expect(response.statusCode).toBe(400);
        }
    });
});

describe('Patch /api/devices/:id',()=>{
    let existingID: any;

    afterAll(async () => {
        if (existingID) {
            await request(server.app).delete(`/api/devices/${existingID}`);
            existingID = null;
        }
    });

    test('should update device successfully', async () => {
        //create a valid device in database for use the existing id
        const responseNewDevice = await createNewDevice();
        existingID = responseNewDevice.body.uid;

        let updatedDevice = { vendor: `testJestVendorUpdate`, status: 'online' };
        let response = await request(server.app).patch(`${url}/${existingID}`).send(updatedDevice);
        while (response.body.errors) {
            updatedDevice = { vendor: `testJestVendorUpdate${Date.now()}`, status: 'online' };
            response = await request(server.app).patch(`${url}/${existingID}`).send(updatedDevice);
        }

        verifyDeviceStructure(response.body)
        expect(response.body.vendor).toEqual(updatedDevice.vendor);
        expect(response.body.status).toEqual(updatedDevice.status);
        expect(response.statusCode).toBe(200);
    });

    test('should respond with a content-type of application/json', async () => {
        let updatedDevice = { vendor: `testJestVendorUpdate${Date.now()}`};
        const response = await request(server.app).patch(`${url}/${existingID}`).send(updatedDevice);
        expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
        expect(response.statusCode).toBe(200);
    });

    test('verify the structure of the device ', async () => {
        const response = await request(server.app).patch(`${url}/${existingID}`).send();
            verifyDeviceStructure(response.body);
            expect(response.statusCode).toBe(200);
    });

    test('should respond with a status 400 if ID is Invalid Format', async () => {
        const invalidID:string = '20f66fc8-b250-48dc-a0c7-b40e54e045e6';
        const response = await request(server.app).patch(`${url}/${invalidID}`).send();
        expect(response.statusCode).toBe(400);
        expect(response.body.errors[0].msg).toBe('ID should be a number');
    });

    test('should respond with a status 404 if ID not exists ', async () => {
        const invalidID = 0 ;
        const response = await request(server.app).patch(`${url}/${invalidID}`).send();
        expect(response.statusCode).toBe(404);
        expect(response.body.msg).toBe('Device not found');
    });

    test('should update only specified fields', async () => {
        const partiallyUpdatedDevice = { vendor: `jestnewVendor${Date.now()}` };
        let datecreatedFormated:String;
        let dateupdatedFormated:String;

        // get device details before update
        const responseBeforeUpdate = await request(server.app).get(`${url}/${existingID}`).send();
        const deviceBeforeUpdate = responseBeforeUpdate.body[0];

        //perform update
        const responseAfterUpdate = await request(server.app).patch(`${url}/${existingID}`).send(partiallyUpdatedDevice);
        

        expect(responseAfterUpdate.statusCode).toBe(200);
        expect(responseAfterUpdate.body.vendor).toEqual(partiallyUpdatedDevice.vendor);
        expect(responseAfterUpdate.body.status).toEqual(deviceBeforeUpdate.status);
        expect(responseAfterUpdate.body.uid).toEqual(deviceBeforeUpdate.uid);
        expect(responseAfterUpdate.body.date_created).toEqual(deviceBeforeUpdate.date_created);
        if(deviceBeforeUpdate.date_updated !== undefined){
            expect(responseAfterUpdate.body.date_updated).toEqual(deviceBeforeUpdate.date_updated);
        }
    });
});

describe('Delete /api/devices/:id', () => {

    let existingId: any;

    test('should respond status 200 delete-success', async () => {
        //create a valid device in database for use the existing id
        const response = await createNewDevice();
        existingId = response.body.uid;

        const responseDelete = await request(server.app).delete(`${url}/${existingId}`);
        expect(responseDelete.statusCode).toBe(200);

    });

    test('should respond with a status 400 if ID is Invalid Format', async () => {
        const invalidID:string = '20f66fc8-b250-48dc-a0c7-b40e54e045e6';
        const response = await request(server.app).delete(`${url}/${invalidID}`).send();
        expect(response.statusCode).toBe(400);
        expect(response.body.errors[0].msg).toBe('ID should be a number');
    });

    test('should respond with a status 404 if gateway not exist or not found', async () => {
        const invalidID = 0 ;
        const response = await request(server.app).delete(`${url}/${invalidID}`).send();
        expect(response.statusCode).toBe(404);
        expect(response.body.msg).toBe('Device not found');
    });

});

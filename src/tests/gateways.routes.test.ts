import request from 'supertest';
import Server from '../models/server';
import { disconnect } from '../database/db.config';
import { createNewGateway, generateRandomIP, verifyDeviceStructure, verifyGatewayStructure } from './test-helpers';

let url: string = '/api/gateways';

let server: Server;
beforeAll(() => {
    server = new Server()
});
afterAll(async () => {
    await disconnect();
});

describe('GET /api/gateways', () => {

    test('should respond with a content-type of application/json', async () => {
        const response = await request(server.app).get(url).send();
        expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
    });

    test('should respond with an array of gateways', async () => {
        const response = await request(server.app).get(url).send();
        expect(response.body.gateways).toBeInstanceOf(Array);
        expect(response.statusCode).toBe(200);
    });

    test('should respond paginate with query parameters', async () => {
        const response = await request(server.app).get(`${url}?from=0&limits=5`).send()
        expect(response.body.gateways.length).toBeLessThanOrEqual(5);
        expect(response.statusCode).toBe(200);
    });

    test('verify the structure of the every gateway of the list', async () => {
        const response = await request(server.app).get(url).send();
        if (response.body.gateways.length > 0) {
            for (let gateway of response.body.gateways) {
                verifyGatewayStructure(gateway);
            }
        }
        expect(response.statusCode).toBe(200);
    });

    test('should respond with an array of devices associated to a gateway', async () => {
        const response = await request(server.app).get(url).send();
        if (response.body.gateways.length > 0) {
            for (let gateway of response.body.gateways) {
                expect(gateway.associated_devices).toBeInstanceOf(Array);
            }
        }
        expect(response.statusCode).toBe(200);
    });

    test('verify the structure of devices associated to a gateway', async () => {
        const response = await request(server.app).get(url).send();
        if (response.body.gateways.length > 0) {
            for (let gateway of response.body.gateways) {
                if (gateway.associated_devices.length > 0) {
                    for (let a_dev of gateway.associated_devices) {
                        verifyDeviceStructure(a_dev);
                    }
                }
            }
        }
        expect(response.statusCode).toBe(200);
    });
});


describe('GET /api/gateways/:id', () => {
    const id = '3d3fb884-2256-4476-abe1-067b102e199f';

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

    test('verify the structure of the gateway', async () => {
        const response = await request(server.app).get(`${url}/${id}`).send();
        if (response.body.length > 0) {
            const gateway = response.body[0]
            verifyGatewayStructure(gateway);
        }
        expect(response.statusCode).toBe(200);
    });

    test('should respond with an array of devices associated to a gateway', async () => {
        const response = await request(server.app).get(`${url}/${id}`).send();
        if (response.body.length > 0) {
            for (let gateway of response.body) {
                expect(gateway.associated_devices).toBeInstanceOf(Array);
            }
        }
        expect(response.statusCode).toBe(200);
    });

    test('verify the structure of devices associated to a gateway', async () => {
        const response = await request(server.app).get(`${url}/${id}`).send();
        if (response.body.length > 0) {
            for (let gateway of response.body) {
                if (gateway.associated_devices.length > 0) {
                    for (let a_dev of gateway.associated_devices) {
                        verifyDeviceStructure(a_dev);
                    }
                }
            }
        }
        expect(response.statusCode).toBe(200);
    });

    test('should respond with a status 400 if ID is Invalid Format', async () => {
        const invalidID = '123';
        const response = await request(server.app).get(`${url}/${invalidID}`).send();
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Invalid UUID format');
    });
});

describe('Post /api/gateways', () => {

    let createdGatewayId: any;

    afterEach(async () => {
        if (createdGatewayId) {
            await request(server.app).delete(`/api/gateways/${createdGatewayId}`);
            createdGatewayId = null;
        }
    });

    test('POST /api/gateways - success', async () => {

        const resp = await createNewGateway();

        expect(resp.body).toHaveProperty('id');
        expect(resp.body).toHaveProperty('serialnumber');
        expect(resp.body).toHaveProperty('name');
        expect(resp.body).toHaveProperty('ipv4address');
        expect(resp.body.name).toEqual(resp.body.name);
        expect(resp.body.ipv4address).toEqual(resp.body.ipv4address);
        expect(resp.statusCode).toBe(200);

        createdGatewayId = resp.body.serialnumber;

    });

    test('failure, name is required and ipv4address is required', async () => {
        const fields = [
            {},
            { name: "new Name" },
            { ipv4address: '10.0.0.1' }
        ]

        for (const body of fields) {
            const response = await request(server.app).post(url).send(body);
            expect(response.statusCode).toBe(400);
        }
    });

    test('failure, name already exists', async () => {
        const newGateway = { name: 'jestExistingName', ipv4address: '10.0.0.1' };
        const response = await request(server.app).post(url).send(newGateway);
        expect(response.statusCode).toBe(400);
    });

    test('failure, ipv4address already exists', async () => {
        const newGateway = { name: 'newName', ipv4address: 'jestExistingIP' };
        const response = await request(server.app).post(url).send(newGateway);
        expect(response.statusCode).toBe(400);
    });

    test('failure, ipv4address format is not valid', async () => {
        const newGateway = { name: 'newName', ipv4address: 'invalidIP' };
        const response = await request(server.app).post(url).send(newGateway);
        expect(response.statusCode).toBe(400);
    });

    test('failure, subnet is already in use', async () => {
        const newGateway = { name: 'newName', ipv4address: 'jestExistingSubnet' };
        const response = await request(server.app).post(url).send(newGateway);
        expect(response.statusCode).toBe(400);
    });

});

describe('Patch /api/gateways/:id', () => {

    let existingID: any;

    afterAll(async () => {
        if (existingID) {
            await request(server.app).delete(`/api/gateways/${existingID}`);
            existingID = null;
        }
    });

    test('should update gateway successfully', async () => {
        //create a valid gateway in database for use the existing id
        const responseNewGateway = await createNewGateway();
        existingID = responseNewGateway.body.serialnumber;

        let updatedGateway = { name: `testJestNameUpdate${Date.now()}`, ipv4address: generateRandomIP() };
        let response = await request(server.app).patch(`${url}/${existingID}`).send(updatedGateway);
        while (response.body.error) {
            updatedGateway = { name: `testJestName${Date.now()}`, ipv4address: generateRandomIP() };
            response = await request(server.app).patch(`${url}/${existingID}`).send(updatedGateway);
        }

        verifyGatewayStructure(response.body[0])
        expect(response.body[0].name).toEqual(updatedGateway.name);
        expect(response.body[0].ipv4address).toEqual(updatedGateway.ipv4address);
        expect(response.statusCode).toBe(200);
    });

    test('should respond with a content-type of application/json', async () => {
        let updatedGateway = { name: `testJestNameUpdate${Date.now()}`, ipv4address: generateRandomIP() };
        const response = await request(server.app).patch(`${url}/${existingID}`).send(updatedGateway);
        expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
        expect(response.statusCode).toBe(200);
    });

    test('should respond with an array', async () => {
        let updatedGateway = { name: `testJestNameUpdate${Date.now()}`, ipv4address: generateRandomIP() };
        const response = await request(server.app).patch(`${url}/${existingID}`).send(updatedGateway);
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });

    test('verify the structure of devices associated to a gateway', async () => {
        const response = await request(server.app).patch(`${url}/${existingID}`).send();
        if (response.body.length > 0) {
            for (let gateway of response.body) {
                if (gateway.associated_devices.length > 0) {
                    for (let a_dev of gateway.associated_devices) {
                        verifyDeviceStructure(a_dev);
                    }
                }
            }
        }
        expect(response.statusCode).toBe(200);
    });

    test('should respond with a status 400 if ID is Invalid Format', async () => {
        const invalidID = '123';
        const response = await request(server.app).patch(`${url}/${invalidID}`).send();
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Invalid UUID format');
    });

    test('should respond with a status 404 if gateway not exist or not found', async () => {
        const notExistingID = '20f66fc8-b250-48dc-a0c7-b40e54e045e6';
        const response = await request(server.app).patch(`${url}/${notExistingID}`).send();
        expect(response.statusCode).toBe(404);
        expect(response.body.msg).toBe('Gateway not found');
    });

    test('failure, name already exists', async () => {
        const updatedGateway = { name: 'jestExistingName', ipv4address: '10.0.0.1' };
        const response = await request(server.app).patch(`${url}/${existingID}`).send(updatedGateway);
        expect(response.statusCode).toBe(400);
    });

    test('failure, ipv4address already exists', async () => {
        const updatedGateway = { name: 'newName', ipv4address: 'jestExistingIP' };
        const response = await request(server.app).patch(`${url}/${existingID}`).send(updatedGateway);
        expect(response.statusCode).toBe(400);
    });

    test('failure, ipv4address format is not valid', async () => {
        const updatedGateway = { name: 'newName', ipv4address: 'invalidIP' };
        const response = await request(server.app).patch(`${url}/${existingID}`).send(updatedGateway);
        expect(response.statusCode).toBe(400);
    });
    test('failure, subnet is already in use', async () => {
        const updatedGateway = { name: 'newName', ipv4address: 'jestExistingSubnet' };
        const response = await request(server.app).patch(`${url}/${existingID}`).send(updatedGateway);
        expect(response.statusCode).toBe(400);
    });
    test('should update only specified fields', async () => {
        const partiallyUpdatedGateway = { name: `jestnewName${Date.now()}` };

        // get gateway details before update
        const responseBeforeUpdate = await request(server.app).get(`${url}/${existingID}`).send();
        const gatewayBeforeUpdate = responseBeforeUpdate.body[0];

        //perform update
        const responseAfterUpdate = await request(server.app).patch(`${url}/${existingID}`).send(partiallyUpdatedGateway);

        expect(responseAfterUpdate.statusCode).toBe(200);
        expect(responseAfterUpdate.body[0].name).toEqual(partiallyUpdatedGateway.name);
        expect(responseAfterUpdate.body[0].ipv4address).toEqual(gatewayBeforeUpdate.ipv4address);
        expect(responseAfterUpdate.body[0].serialnumber).toEqual(gatewayBeforeUpdate.serialnumber);
        expect(responseAfterUpdate.body[0].total_devices_associated).toEqual(gatewayBeforeUpdate.total_devices_associated);
    });
});

describe('Delete /api/gateways/:id', () => {

    let existingId: any;

    test('should respond status 200 delete-success', async () => {
        //create a valid gateway in database for use the existing id
        const response = await createNewGateway();
        existingId = response.body.serialnumber;

        const responseDelete = await request(server.app).delete(`${url}/${existingId}`);
        expect(responseDelete.statusCode).toBe(200);

    });

    test('should respond with a status 400 if ID is Invalid Format', async () => {
        const invalidID = '123';
        const response = await request(server.app).delete(`${url}/${invalidID}`).send();
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Invalid UUID format');
    });

    test('should respond with a status 404 if gateway not exist or not found', async () => {
        const notExistingID = '20f66fc8-b250-48dc-a0c7-b40e54e045e6';
        const response = await request(server.app).delete(`${url}/${notExistingID}`).send();
        expect(response.statusCode).toBe(404);
        expect(response.body.msg).toBe('Gateway not found');
    });

});

import request from 'supertest';
import Server from '../models/server';

let server: Server;

export function generateRandomIP() {
    return `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

export async function createNewGateway() {
    //create a valid gateway in database for use the existing id
    server = new Server();
    let newGateway = { name: `testJestName${Date.now()}`, ipv4address: generateRandomIP() };
    let response = await request(server.app).post('/api/gateways').send(newGateway);
    while (response.body.error) {
        newGateway = { name: `testJestName${Date.now()}`, ipv4address: generateRandomIP() };
        response = await request(server.app).post('/api/gateways').send(newGateway);
    }
    return response;
}
export async function createNewDevice() {
    //create a valid device in database for use the existing id
    server = new Server();
    let newDevice = { vendor: `testJestVendor`};
    let response = await request(server.app).post('/api/devices').send(newDevice);
    
    return response;
}

export function verifyGatewayStructure(gateway: any) {
    expect(gateway).toHaveProperty('id');
    expect(gateway).toHaveProperty('serialnumber');
    expect(gateway).toHaveProperty('name');
    expect(gateway).toHaveProperty('ipv4address');
    expect(gateway).toHaveProperty('total_devices_associated');
    expect(gateway).toHaveProperty('associated_devices');
}

export function verifyDeviceStructure(device: any) {
    expect(device).toHaveProperty('uid');
    expect(device).toHaveProperty('vendor');
    expect(device).toHaveProperty('status');
    expect(device).toHaveProperty('date_created');
}

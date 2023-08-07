import request from "supertest";
import Server from "../models/server";

describe('test the root path',()=>{
    let server:Server;

    beforeEach(()=>{
        server = new Server();
    });

    test('It should respond to the GET method', async () => {
        const response = await request(server.app).get('/');
        expect(response.statusCode).toBe(200);
      });
});
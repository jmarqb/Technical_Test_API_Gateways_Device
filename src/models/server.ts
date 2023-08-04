import path from 'path';

import express from "express";
import 'dotenv/config';
import swaggerUI from 'swagger-ui-express';

import swaggerSpecs from '../swagger';
import gatewaysRoutes from '../routes/gateway.routes';
import devicesRoutes from '../routes/devices.routes';
import assignDevices from '../routes/assign-devices.routes';

export default class Server{
    
    app: express.Application;
    port: string ;

    constructor(){
        this.app = express();
        this.port = String(process.env.PORT);

        this.publicFolder();

        this.middlewares();

        this.routes();

        this.listen();
    }

    private middlewares(){
      this.app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpecs));
      this.app.use( express.json());
    }
    
    private publicFolder(){
      const publicPath = path.resolve( __dirname, '../public');
      this.app.use( express.static(publicPath));
    }
    
    private routes(){
      this.app.use(gatewaysRoutes);
      this.app.use(devicesRoutes);
      this.app.use(assignDevices);
    }
    
    private listen(){
      console.log(this.port);
      this.app.listen(this.port, ()=>{
            console.log(`Server running on port : ${this.port}`);
            console.log(`Documentation available at  http://localhost:${this.port}/api-docs/`);
          });
      }
}
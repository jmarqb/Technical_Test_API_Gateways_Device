import swaggerJsDoc from 'swagger-jsdoc';

const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "API GATEWAY - DEVICE",
        version: "1.0.0",
        description: "API to store information about gateways and their associated devices.",
      },
      components:{
        schemas:{
          gateways:{
            type:'object',
            required:['name', 'ipv4address'],
            properties:{
              id: {
                type: 'string',
                description: 'ID Gateway',
                example: "7d46c4cf-c511-4eba-9300-2bc4231da085"
              },
              name:{
                type:'string',
                description: 'Gateway Name',
                example: "enlace 1"
              },
              ipv4address:{
                type:'string',
                description: 'Gateway IP address',
                example: "192.168.10.1"
              },
              associated_devices: {
                type: 'array',
                items: { $ref: '#/components/schemas/Device' },
                description: 'Devices associated to Gateway.'
              }
            }
          },
          Device: {
            type: 'object',
            required:['vendor', 'status'],
            properties: {
              uid: {
                type: 'integer',
                description: 'Device unique ID.'
              },
              vendor: {
                type: 'string',
                description: 'Device Provider.',
                example: "Tp-LinG"
              },
              status: {
                type: 'string',
                description: 'Device Status.',
                example: "Offline"
              },
              date_created: {
                type: 'string',
                format: 'date-time',
                description: 'Device Date of Creation',
                example: '2023-07-31T12:15:15'
              },
              date_on_update: {
                type: 'string',
                format: 'date-time',
                description: 'Device Date Update',
                example: '2023-07-31T12:15:15'
              }
            }
          }
        }
      }
    },
    apis: ["./src/routes/*.ts"], // where you defined your routes
  };

const specs = swaggerJsDoc(options);

export default specs;
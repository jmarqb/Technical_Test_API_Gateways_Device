import { check } from "express-validator";
import { Router } from "express";

import { validateFields } from "../middlewares/validate-fields";
import { validateUuid } from "../middlewares/validate-uuid";
import { ipv4AddressExists, nameExists } from "../helpers/db-validators";
import { createGateways, deleteGateway, getGateways, getGatewaysById, updateGateways } from "../controllers/gateway.controllers";

const router: Router = Router();
const url: string = '/api/gateways';

//Obtener los gateways
/**
 * @swagger
 * "tags": 
 *    "name" : "Gateways"
 *    "description": "Everything about Gateways"
 * "paths": {
 *   "/api/gateways": {
 *     "get": {
 * "tags":
 *     ["Gateways"],
 *       "summary": "Retrieve a list of gateways",
 *       "parameters": [
 *         {
 *           "in": "query",
 *           "name": "from",
 *           "schema": { "type": "integer" },
 *           "description": "The start index for the list of gateways"
 *         },
 *         {
 *           "in": "query",
 *           "name": "limits",
 *           "schema": { "type": "integer" },
 *           "description": "The number of gateways to return"
 *         }
 *       ],
 *       "responses": {
 *         "200": {
 *           "description": "A list of gateways",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "type": "object",
 *                 "properties": {
 *                   "total": { 
 *                     "type": "integer",
 *                     "description": "The number of gateways returned"
 *                   },
 *                   "gateways": {
 *                     "type": "array",
 *                     "items": { "$ref": "#/components/schemas/gateways" }
 *                   }
 *                 }
 *               }
 *             }
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 */
router.get(url, getGateways);

//obtener gateway por id-serial number
/**
 * @swagger
 * "/api/gateways/{id}": {
 *   "get": {
 * "tags":
 *     ["Gateways"],
 *     "summary": "Find gateway by ID",
 *     "description": "Returns a single gateway",
 *     "operationId": "getGatewayById",
 *     "parameters": [
 *       {
 *         "name": "id",
 *         "in": "path",
 *         "description": "ID of gateway to return",
 *         "required": true,
 *         "schema": {
 *           "type": "string",
 *           "format": "uuid",
 *           "example": "c20c273f-9a0e-48b7-b10b-ccfa5ffdd336"
 *         }
 *       }
 *     ],
 *     "responses": {
 *       "200": {
 *         "description": "successful operation",
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "$ref": "#/components/schemas/gateways"
 *             }
 *           },
 *           "application/xml": {
 *             "schema": {
 *               "$ref": "#/components/schemas/gateways"
 *             }
 *           }
 *         }
 *       },
 *       "400": {
 *         "description": "Invalid UUID format"
 *       },
 *       "500": {
 *         "description": "Internal Server Error"
 *       }
 *     }
 *   }
 * }
 */
router.get(`${url}/:id`, [
   validateUuid
], getGatewaysById);

/**
 * @swagger
* paths:
 *   /api/gateways:
 *     post:
 *       tags:
 *         - 'Gateways'
 *       summary: Create a new gateway
 *       description: Create a new Gateway with the provided name and IP address
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: The name of the Gateway
 *                 ipv4address:
 *                   type: string
 *                   description: The IP address of the Gateway
 *       responses:
 *         200:
 *           description: The created Gateway
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The id of the Gateway
 *                   serialnumber:
 *                     type: string
 *                     description: The serial number of the Gateway
 *                   name:
 *                     type: string
 *                     description: The name of the Gateway
 *                   ipv4address:
 *                     type: string
 *                     description: The IP address of the Gateway
 *         400:
 *           description: Subnet is already in use
 *         500:
 *           description: Something goes wrong
 */

router.post(url, [
   check('name', 'Name is required').not().isEmpty(),
   check('name').custom(nameExists),
   check('ipv4address', 'Field is required').not().isEmpty(),
   check('ipv4address').isIP().withMessage('Must be a valid IP address'),
   check('ipv4address').custom(ipv4AddressExists),
   validateFields
], createGateways);

//actualizar gateway
/**
 * @swagger
 * /api/gateways/{id}:
 *   patch:
 *     tags: ["Gateways"]
 *     summary: "Update an existing Gateway"
 *     description: "Update the name and/or IP address of an existing Gateway identified by id"
 *     parameters:
 *       - name: id
 *         in: path
 *         description: "The id of the Gateway to update"
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: "object"
 *             properties:
 *               name:
 *                 type: "string"
 *                 description: "The new name of the Gateway"
 *               ipv4address:
 *                 type: "string"
 *                 description: "The new IP address of the gateway"
 *     responses:
 *       200:
 *         description: "The updated Gateway"
 *         content:
 *           application/json:
 *             schema:
 *               type: "object"
 *               properties:
 *                 id:
 *                   type: "integer"
 *                   description: "The id of the Gateway"
 *                 serialnumber:
 *                   type: "string"
 *                   description: "The serial number of the Gateway"
 *                 name:
 *                   type: "string"
 *                   description: "The name of the Gateway"
 *                 ipv4address:
 *                   type: "string"
 *                   description: "The IP address of the Gateway"
 *       404:
 *         description: "Gateway not found"
 *       500:
 *         description: "Something goes wrong"
 */
router.patch(`${url}/:id`, [
   validateUuid,
   //  check('id', 'Invalid UUID').isUUID(),
   check('name').optional().custom(nameExists).not().isEmpty().withMessage('Name cannot be empty'),
   check('ipv4address').optional().custom(ipv4AddressExists).isIP().withMessage('Invalid IPv4 address'),
   validateFields
], updateGateways);

//delete - gateway
/**
 * @swagger
 * /api/gateways/{id}:
 *   delete:
 *     tags: ["Gateways"]
 *     summary: "Delete a Gateway"
 *     description: "Delete a Gateway identified by id"
 *     parameters:
 *       - name: id
 *         in: path
 *         description: "The id of the Gateway to delete"
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "Gateway successfully deleted"
 *       404:
 *         description: "Gateway not found"
 *       500:
 *         description: "Something goes wrong"
 */
router.delete(`${url}/:id`, [
   validateUuid,
   validateFields
], deleteGateway);

export default router;

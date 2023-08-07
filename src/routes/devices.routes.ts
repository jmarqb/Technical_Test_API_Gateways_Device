import { check } from "express-validator";
import { Router } from "express";

import { allowedStatus } from "../middlewares/validate-status";
import { validateFields } from '../middlewares/validate-fields';
import { createDevice, deleteDevice, getDeviceById, getDevices, updateDevice } from "../controllers/devices.controllers";

const router = Router();
const url = '/api/devices';

//get devices
/**
 * @swagger
 * tags: 
 *   - name: Devices
 *     description: Everything about Devices
 * paths: 
 *   /api/devices: 
 *     get: 
 *       tags:
 *         - Devices
 *       summary: Retrieve a list of devices
 *       parameters: 
 *         - in: query
 *           name: from
 *           schema: { type: integer }
 *           description: The start index for the list of devices
 *         - in: query
 *           name: limits
 *           schema: { type: integer }
 *           description: The number of devices to return
 *       responses: 
 *         200: 
 *           description: A list of devices
 *           content: 
 *             application/json: 
 *               schema: 
 *                 type: object
 *                 properties: 
 *                   total: 
 *                     type: integer
 *                     description: The number of devices returned
 *                   devices: 
 *                     type: array
 *                     items: { $ref: '#/components/schemas/Device' }
 *         500:
 *           description: Internal Server Error
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 */
router.get(url, getDevices);

//get device by id
/**
 * @swagger
 * "/api/devices/{id}": {
 *   "get": {
 * "tags":
 *     ["Devices"],
 *     "summary": "Find device by ID",
 *     "description": "Returns a single device",
 *     "operationId": "getDeviceById",
 *     "parameters": [
 *       {
 *         "name": "id",
 *         "in": "path",
 *         "description": "ID of device to return",
 *         "required": true,
 *         "schema": {
 *           "type": "integer",
 *           "format": "int64",
 *           "example": "25"
 *         }
 *       }
 *     ],
 *     "responses": {
 *       "200": {
 *         "description": "successful operation",
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "$ref": "#/components/schemas/Device"
 *             }
 *           },
 *           "application/xml": {
 *             "schema": {
 *               "$ref": "#/components/schemas/Device"
 *             }
 *           }
 *         }
 *       },
 *       "500": {
 *         "description": "Internal Server Error"
 *       }
 *     }
 *   }
 * }
 */
router.get(`${url}/:id`,[
check('id', 'ID should be a number').isNumeric(),
validateFields
],getDeviceById );

//create device
/**
 * @swagger
 * tags:
 *   - name: Devices
 *     description: Everything about Devices
 * paths:
 *   /api/devices:
 *     post:
 *       tags:
 *         - Devices
 *       summary: Create a new device
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vendor:
 *                   type: string
 *                   description: The vendor of the device
 *       responses:
 *         200:
 *           description: The created device
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The id of the created device
 *                   vendor:
 *                     type: string
 *                     description: The vendor of the device
 *                   status:
 *                     type: string
 *                     description: The status of the device
 *                   date_created:
 *                     type: string
 *                     format: date-time
 *                     description: The creation date of the device
 *         400:
 *           description: Vendor is required
 *         500:
 *           description: Something goes wrong
 */
router.post(url,[
    check('vendor','Vendor is required').not().isEmpty(),
    check('vendor', 'vendor should be a string').isString(),
    validateFields
],createDevice);

//update device
/**
 * @swagger
 * /api/devices/{id}:
 *   patch:
 *     tags:
 *       - Devices
 *     summary: Update a device
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the device to update
 *         required: true
 *         schema: 
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vendor:
 *                 type: string
 *                 description: New vendor for the device
 *               status:
 *                 type: string
 *                 description: New status for the device
 *                 enum: [online, offline]
 *     responses:
 *       '200':
 *         description: The updated device
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: 
 *                   type: integer
 *                 vendor: 
 *                   type: string
 *                 status: 
 *                   type: string
 *                 date_created: 
 *                   type: string
 *                   format: date-time
 *                 date_updated: 
 *                   type: string
 *                   format: date-time
 *       '404':
 *         description: Device not found
 *       '500':
 *         description: Something goes wrong
 */
router.patch(`${url}/:id`,[
    check('id', 'ID should be a number').isNumeric(),
    check('vendor').optional().isString().withMessage('vendor must be a string'),
    allowedStatus('online','offline'),
    check('status').optional().isString().withMessage('status must be a string'),
    validateFields
 ], updateDevice);

//delete devices
/**
 * @swagger
 * /api/devices/{id}:
 *   delete:
 *     tags:
 *       - Devices
 *     summary: Delete a device
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the device to delete
 *         required: true
 *         schema: 
 *           type: integer
 *           format: int64
 *     responses:
 *       '200':
 *         description: Device deleted successfully
 *       '404':
 *         description: Device not found
 *       '500':
 *         description: Something goes wrong
 */

router.delete(`${url}/:id`,[
    check('id', 'ID should be a number').isNumeric(),
    validateFields
  ], deleteDevice);

export default router;

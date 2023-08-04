import { Router } from "express";
import { check } from "express-validator";
import { assignDevice } from "../controllers/assign-devices.controllers";
import { validateFields } from '../middlewares/validate-fields';

const url:string = '/api/gateways/assignDevice';
const router = Router();

// Assign_Devices_to_Gateway
/**
 * @swagger
 * tags:
  - name: Assign_Devices_to_Gateway
    description: Assign_Devices_to_Gateway
 * /api/gateways/assignDevice:
 *   post:
 *     tags:
 *       - Assign_Devices_to_Gateway
 *     summary: Assign a device to a gateway
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gateway_uuid:
 *                 type: string
 *                 format: uuid
 *                 description: The UUID of the gateway
 *               device_uid:
 *                 type: integer
 *                 description: The UID of the device
 *     responses:
 *       '200':
 *         description: Device successfully assigned to the gateway
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 device_uid:
 *                   type: integer
 *                   description: The UID of the device
 *                 gateway_uuid:
 *                   type: string
 *                   format: uuid
 *                   description: The UUID of the gateway
 *                 asignacion:
 *                   type: string
 *                   description: Success message
 *       '400':
 *         description: Validation Error - Gateway/Device not found - Device already associated - Gateway reached limit
 *       '500':
 *         description: Something goes wrong
 */

router.post(url,[
    check('gateway_uuid', 'The gateway_uuid is required').not().isEmpty(),
    check('gateway_uuid').isUUID(4),
    check('device_uid').isNumeric(),
    check('device_uid','The device_uid is required').not().isEmpty(),
    validateFields
],assignDevice);




export default router
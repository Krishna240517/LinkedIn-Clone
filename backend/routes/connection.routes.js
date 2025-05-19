import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js"
import { sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest, getConnectionRequests, getUserConnections, removeConnection, getConnectionStatus } from "../controller/connectionRequest.controller.js";
const connectionRoutes = express.Router();

connectionRoutes.post("/request/:userId",authenticate, sendConnectionRequest);
connectionRoutes.put("/accept/:requestId",authenticate, acceptConnectionRequest);
connectionRoutes.put("/reject/:requestId",authenticate, rejectConnectionRequest);

//get all connection request for the current user
connectionRoutes.get("/requests",authenticate, getConnectionRequests);
//get all connections for a user
connectionRoutes.get("/",authenticate,getUserConnections);
//
connectionRoutes.delete("/:userId",authenticate,removeConnection);
connectionRoutes.get("/status/:userId",authenticate, getConnectionStatus);




export default connectionRoutes;
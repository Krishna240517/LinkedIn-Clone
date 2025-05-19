import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { getSuggestedConnections , getPublicProfile,updateProfile } from "../controller/user.controller.js";
const userRoutes = express.Router();


userRoutes.get("/suggestions",authenticate,getSuggestedConnections);
userRoutes.get("/:username",authenticate,getPublicProfile)
userRoutes.put("/profile",authenticate,updateProfile);


export default userRoutes;
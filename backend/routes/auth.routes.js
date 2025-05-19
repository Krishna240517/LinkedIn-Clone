import express from "express";
const authRoutes = express.Router();
import{signup, login, logout, getCurrentUser} from "../controller/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../inputValidator/validator.js"
import { signUpSchema,logInSchema } from "../inputValidator/schema.js";


authRoutes.post("/signup",validate(signUpSchema),signup);
authRoutes.post("/login",validate(logInSchema),login);
authRoutes.post("/logout",logout);
authRoutes.get("/me",authenticate,getCurrentUser)



export default authRoutes;
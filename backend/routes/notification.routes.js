import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { getUserNotifications, markNotificationAsRead, deleteNotification } from "../controller/notification.controller.js";
const notificationRoutes = express.Router();

notificationRoutes.get("/",authenticate, getUserNotifications);
notificationRoutes.put("/:id/read",authenticate, markNotificationAsRead);
notificationRoutes.delete("/:id",authenticate,deleteNotification);

export default notificationRoutes;
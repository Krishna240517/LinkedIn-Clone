import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./lib/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import cookieParser from "cookie-parser";
import notificationRoutes from "./routes/notification.routes.js";
const app = express();
const PORT = process.env.PORT;


app.use(cookieParser());
app.use(express.json());
app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/user",userRoutes);
app.use("/api/v1/post",postRoutes);
app.use("/api/v1/notification",notificationRoutes);



function main(){
    connectDB();
    app.listen(PORT,()=>{
        console.log(`Listening....${PORT}`);
    })
}
main();
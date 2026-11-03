import { Router } from "express";
import { createAuthJwt, logout, getMe } from "../controllers/authController";
import { verifyJWT } from "../middleware/verifyJWT";

const authRouter = Router();

authRouter.post("/jwt", createAuthJwt);
authRouter.post("/logout", logout);
authRouter.get("/me", verifyJWT, getMe);

export default authRouter;


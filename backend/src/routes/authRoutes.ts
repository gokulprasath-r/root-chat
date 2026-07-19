import { Router } from "express";
import {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
} from "../controllers/authController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected: only reachable with a valid token.
router.get("/me", requireAuth, getMe);

export default router;

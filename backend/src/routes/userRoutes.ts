import { Router } from "express";
import {
  searchUser,
  updateProfile,
  updateAvatar,
  deleteAccount,
} from "../controllers/userController";
import { requireAuth } from "../middleware/auth";

const router = Router();

// All user routes require a logged-in user.
router.use(requireAuth);

router.get("/search", searchUser);
router.put("/me", updateProfile);
router.post("/me/avatar", updateAvatar);
router.delete("/me", deleteAccount);

export default router;

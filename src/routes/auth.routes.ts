
import { Router } from "express";
import { auth } from "../auth/auth.js";

const router = Router();

router.post("/set-password", async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    const { newPassword } = req.body;

    if (
      typeof newPassword !== "string" ||
      newPassword.length < 6 ||
      newPassword.length > 128
    ) {
      return res.status(400).json({
        success: false,
        message: "Password must be 6-128 characters",
      });
    }

    await auth.api.setPassword({
      body: { newPassword },
      headers: req.headers as any,
    });

    return res.json({
      success: true,
      message: "Password set successfully",
    });
  } catch (error) {
    console.error("Set password error:", error);

    return res.status(400).json({
      success: false,
      message: "Could not set password",
    });
  }
});

export default router;

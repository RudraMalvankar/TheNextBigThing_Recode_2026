import { Router } from "express";
import { getAuthUser, requireAuth } from "../middleware/auth";
import { createAuthToken, getConfiguredCredentials } from "../utils/auth";

const router = Router();

router.post("/login", (req, res) => {
  const body = req.body as { email?: string; password?: string };
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password?.trim() ?? "";

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  const configured = getConfiguredCredentials();
  const isAuthorized = email === configured.email && password === configured.password;

  if (!isAuthorized) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const user = { email: configured.email, name: configured.name };
  const token = createAuthToken(user);

  res.status(200).json({ token, user });
});

router.get("/me", requireAuth, (_req, res) => {
  const user = getAuthUser(res);

  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  res.status(200).json({ user });
});

export const authRouter = router;
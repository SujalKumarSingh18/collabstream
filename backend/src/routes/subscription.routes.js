import { Router } from "express";
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// Secure all subscription routes
router.use(verifyJWT);

// Route: Get subscriber list / toggle subscription
router.route("/c/:channelId")
    .get(getUserChannelSubscribers)
    .post(toggleSubscription);

// Route: Get channels subscribed to
router.route("/u").get(getSubscribedChannels);

export default router;

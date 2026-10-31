
import { Router } from "express";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { getDB } from "../config/db.js";
import {
  verifyToken,
  type AuthenticatedRequest,
} from "../middleware/auth.middleware.js";

const router = Router();

const eventSchema = z.object({
  title: z.string().trim().min(3).max(100),
  description: z.string().trim().min(10).max(1000),
  location: z.string().trim().min(3).max(150),
  eventDate: z.string().refine(
    (date) => {
      const parsed = new Date(date);
      return !Number.isNaN(parsed.getTime()) && parsed.getTime() > Date.now();
    },
    "Event date must be in the future"
  ),
  image: z.string().url(),
  category: z.string().trim().min(2),
});

// GET HOME EVENTS - ONLY 6 UPCOMING EVENTS
router.get("/home", async (_req, res) => {
  try {
    const events = await getDB()
      .collection("events")
      .find({
        eventDate: { $gte: new Date().toISOString() },
      })
      .sort({ eventDate: 1 })
      .limit(6)
      .toArray();

    res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("Home events error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch home events",
    });
  }
});

// GET ALL UPCOMING EVENTS
router.get("/", async (_req, res) => {
  try {
    const events = await getDB()
      .collection("events")
      .find({
        eventDate: { $gte: new Date().toISOString() },
      })
      .sort({ eventDate: 1 })
      .toArray();

    res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
    });
  }
});

// GET LOGGED-IN USER'S JOINED EVENTS
router.get(
  "/joined/me",
  verifyToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const events = await getDB()
        .collection("events")
        .find({
          participants: req.user!.id,
          eventDate: { $gte: new Date().toISOString() },
        })
        .sort({ eventDate: 1 })
        .toArray();

      res.status(200).json({
        success: true,
        events,
      });
    } catch (error) {
      console.error("Joined events error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch joined events",
      });
    }
  }
);

// GET SINGLE EVENT
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (typeof id !== "string" || !ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
      return;
    }

    const event = await getDB()
      .collection("events")
      .findOne({ _id: new ObjectId(id) });

    if (!event) {
      res.status(404).json({
        success: false,
        message: "Event not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Get event error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch event",
    });
  }
});

// CREATE EVENT
router.post(
  "/",
  verifyToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const validation = eventSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Invalid event information",
          errors: validation.error.flatten().fieldErrors,
        });
        return;
      }

      const event = {
        ...validation.data,
        createdBy: req.user!.id,
        createdAt: new Date(),
        participants: [],
      };

      const result = await getDB()
        .collection("events")
        .insertOne(event);

      res.status(201).json({
        success: true,
        message: "Event created successfully",
        event: {
          _id: result.insertedId,
          ...event,
        },
      });
    } catch (error) {
      console.error("Create event error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create event",
      });
    }
  }
);

// JOIN EVENT
router.post(
  "/:id/join",
  verifyToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const id = req.params.id;

      if (typeof id !== "string" || !ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid event ID",
        });
        return;
      }

      const db = getDB();
      const userId = req.user!.id;

      const event = await db.collection("events").findOne({
        _id: new ObjectId(id),
      });

      if (!event) {
        res.status(404).json({
          success: false,
          message: "Event not found",
        });
        return;
      }

      if (event.createdBy === userId) {
        res.status(400).json({
          success: false,
          message: "You cannot join your own event",
        });
        return;
      }

      if (new Date(event.eventDate).getTime() <= Date.now()) {
        res.status(400).json({
          success: false,
          message: "This event has already passed",
        });
        return;
      }

      const result = await db.collection("events").updateOne(
        {
          _id: new ObjectId(id),
          participants: { $ne: userId },
        },
        {
          $addToSet: { participants: userId },
        }
      );

      if (result.modifiedCount === 0) {
        res.status(409).json({
          success: false,
          message: "You have already joined this event",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "You joined the event successfully!",
      });
    } catch (error) {
      console.error("Join event error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to join event",
      });
    }
  }
);

// UPDATE EVENT - ONLY OWNER
router.put(
  "/:id",
  verifyToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const id = req.params.id;

      if (typeof id !== "string" || !ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid event ID",
        });
        return;
      }

      const validation = eventSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Invalid event information",
          errors: validation.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await getDB().collection("events").updateOne(
        {
          _id: new ObjectId(id),
          createdBy: req.user!.id,
        },
        {
          $set: validation.data,
        }
      );

      if (result.matchedCount === 0) {
        const exists = await getDB().collection("events").findOne({
          _id: new ObjectId(id),
        });

        res.status(exists ? 403 : 404).json({
          success: false,
          message: exists
            ? "You are not allowed to update this event"
            : "Event not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Event updated successfully",
      });
    } catch (error) {
      console.error("Update event error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update event",
      });
    }
  }
);

// DELETE EVENT - ONLY OWNER
router.delete(
  "/:id",
  verifyToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const id = req.params.id;

      if (typeof id !== "string" || !ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid event ID",
        });
        return;
      }

      const result = await getDB().collection("events").deleteOne({
        _id: new ObjectId(id),
        createdBy: req.user!.id,
      });

      if (result.deletedCount === 0) {
        const exists = await getDB().collection("events").findOne({
          _id: new ObjectId(id),
        });

        res.status(exists ? 403 : 404).json({
          success: false,
          message: exists
            ? "You are not allowed to delete this event"
            : "Event not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Event deleted successfully",
      });
    } catch (error) {
      console.error("Delete event error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete event",
      });
    }
  }
);

export default router;

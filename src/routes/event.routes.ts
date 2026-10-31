
import { Router } from "express";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { getDB } from "../config/db.js";
import {
  verifyToken,
  type AuthenticatedRequest,
} from "../middleware/auth.middleware.js";

const router = Router();

// Event validation schema
const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description is too short"),
  location: z.string().min(3, "Location is required"),
  eventDate: z.string().refine(
    (date) => !Number.isNaN(Date.parse(date)),
    "Invalid event date"
  ),
  image: z.string().url("Please provide a valid image URL"),
  category: z.string().min(2, "Category is required"),
});

// ========================================
// GET ALL UPCOMING EVENTS
// ========================================
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

// ========================================
// GET LOGGED-IN USER'S JOINED EVENTS
// Keep this route before /:id
// ========================================
router.get(
  "/joined/me",
  verifyToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;

      const events = await getDB()
        .collection("events")
        .find({
          participants: userId,
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

// ========================================
// GET SINGLE EVENT
// ========================================
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
      .findOne({
        _id: new ObjectId(id),
      });

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

// ========================================
// CREATE EVENT (LOGIN REQUIRED)
// ========================================
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

// ========================================
// JOIN EVENT (LOGIN REQUIRED)
// ========================================
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
          $addToSet: {
            participants: userId,
          },
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

// ========================================
// UPDATE EVENT (ONLY OWNER CAN UPDATE)
// ========================================

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

      const db = getDB();

      const existingEvent = await db.collection("events").findOne({
        _id: new ObjectId(id),
      });

      if (!existingEvent) {
        res.status(404).json({
          success: false,
          message: "Event not found",
        });
        return;
      }

      if (existingEvent.createdBy !== req.user!.id) {
        res.status(403).json({
          success: false,
          message: "You are not allowed to update this event",
        });
        return;
      }

      await db.collection("events").updateOne(
        {
          _id: new ObjectId(id),
          createdBy: req.user!.id,
        },
        {
          $set: validation.data,
        }
      );

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


// ========================================
// DELETE EVENT (ONLY OWNER CAN DELETE)
// ========================================

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

      const db = getDB();

      const existingEvent = await db.collection("events").findOne({
        _id: new ObjectId(id),
      });

      if (!existingEvent) {
        res.status(404).json({
          success: false,
          message: "Event not found",
        });
        return;
      }

      if (existingEvent.createdBy !== req.user!.id) {
        res.status(403).json({
          success: false,
          message: "You are not allowed to delete this event",
        });
        return;
      }

      await db.collection("events").deleteOne({
        _id: new ObjectId(id),
        createdBy: req.user!.id,
      });

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

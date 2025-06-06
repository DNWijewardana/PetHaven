import express from "express";
import User from "../models/UserModel.js";
import { initEdgeStore } from "@edgestore/server";
import { createEdgeStoreExpressHandler } from "@edgestore/server/adapters/express";
import Pet from "../models/PetModel.js";
import {
  sendAdoptPetEmail,
  sendLostPetEmail,
} from "../services/mailService.js";

const router = express.Router();

// Save user into database
router.post("/user/register", async (req, res) => {
  const { name, email, picture, sub, isAdmin } = req.body;
  try {
    // check all required fields
    if (!name || !email || !picture || !sub) {
      return res.status(200).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // check user already exists
    const isUserExixts = await User.findOne({ email });
    if (isUserExixts) {
      return res.status(200).json({
        success: false,
        message: `Last seen ${isUserExixts.updatedAt.toLocaleString()}`,
      });
    }

    // save user into database
    const user = new User({
      name,
      email,
      picture,
      auth0_id: sub,
      role: isAdmin ? "admin" : "user",
    });
    await user.save();
    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Save lost pet into database
router.post("/pet/lost", async (req, res) => {
  const { name, type, owner, location, date, description, image } = req.body;
  try {
    console.table(req.body);
    // check all required fields
    if (
      !name ||
      !type ||
      !owner ||
      !location ||
      !date ||
      !description ||
      !image
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // save pet into database
    const pet = new Pet({
      name,
      type,
      owner,
      location,
      date: new Date(date),
      description,
      image,
    });
    await pet.save();
    res.status(201).json({
      success: true,
      message: "Lost pet published successfully!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Save adopt pet into database
router.post("/pet/adopt", async (req, res) => {
  const { name, type, owner, location, description, image } = req.body;
  try {
    // check all required fields
    if (!name || !type || !owner || !location || !description || !image) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // save pet into database
    const pet = new Pet({
      name,
      type,
      owner,
      location,
      description,
      image,
    });
    await pet.save();
    res.status(201).json({
      success: true,
      message: "Adopt pet published successfully!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get latest top 10 all pets from database
router.get("/pets/latest", async (req, res) => {
  try {
    const pets = await Pet.find({ $or: [{ type: "lost" }, { type: "adopt" }] })
      .sort({ createdAt: -1 })
      .limit(10);
    res.status(200).json({ success: true, pets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all lost pets from database
router.get("/pets/lost", async (req, res) => {
  try {
    const pets = await Pet.find({ type: "lost" });
    res.status(200).json({ success: true, pets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all adopt pets from database
router.get("/pets/adopt", async (req, res) => {
  try {
    const pets = await Pet.find({ type: "adopt" });
    res.status(200).json({ success: true, pets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all lost pets posted by specific users
router.post("/my/pets/lost/", async (req, res) => {
  const { email } = req.body;
  try {
    const pets = await Pet.find({ type: "lost", owner: email });
    res.status(200).json({ success: true, pets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all adopt pets posted by specific users
router.post("/my/pets/adopt/", async (req, res) => {
  const { email } = req.body;
  try {
    const pets = await Pet.find({ type: "adopt", owner: email });
    if (pets.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No pets found.",
      });
    }
    res.status(200).json({ success: true, pets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Count lost pets for a specific user
router.post("/my/pets/lost/count", async (req, res) => {
  const { email } = req.body;
  try {
    const count = await Pet.countDocuments({ type: "lost", owner: email });
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Count adoption pets for a specific user
router.post("/my/pets/adopt/count", async (req, res) => {
  const { email } = req.body;
  try {
    const count = await Pet.countDocuments({ type: "adopt", owner: email });
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Count all pet profiles for a specific user (API placeholder)
router.get("/pet-profiles/user/:userId/count", async (req, res) => {
  const userId = req.params.userId;
  try {
    // This is a placeholder. Modify according to your actual pet profiles schema
    // For now, we'll combine lost and adopt pets
    const count = await Pet.countDocuments({ 
      owner: userId,
      $or: [{ type: "lost" }, { type: "adopt" }]
    });
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update lost pet details by validating owner is the same as the one who posted it
router.put("/pet/lost/update", async (req, res) => {
  const { id, name, type, owner, location, date, description } = req.body;
  try {
    // check all required fields
    if (!id || !name || !type || !owner || !location || !date || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // check if pet exists

    const isPetExist = await Pet.findById(id);
    // console table all adta
    console.log(id, name, type, owner, location, date, description);
    if (!isPetExist) {
      return res.status(200).json({
        success: false,
        message: "Pet not found.",
      });
    }
    // check if owner is the same as the one who posted it
    if (isPetExist.owner !== owner) {
      return res.status(200).json({
        success: false,
        message: "You are not the owner of this pet.",
      });
    }

    // Update pet details
    const pet = await Pet.findByIdAndUpdate(
      id,
      {
        name,
        type,
        owner,
        location,
        date: new Date(date),
        description,
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Pet details updated successfully!",
      pet,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update adopt pet details by validating owner is the same as the one who posted it
router.put("/pet/adopt/update", async (req, res) => {
  const { id, name, type, owner, location, description } = req.body;
  try {
    // check all required fields
    if (!id || !name || !type || !owner || !location || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // check if pet exists

    const isPetExist = await Pet.findById(id);
    console.log(isPetExist);
    // console table all adta
    console.log(id, name, type, owner, location, description);
    if (!isPetExist) {
      return res.status(200).json({
        success: false,
        message: "Pet not found.",
      });
    }
    console.log(isPetExist.owner, owner);
    // check if owner is the same as the one who posted it
    if (isPetExist.owner !== owner) {
      return res.status(200).json({
        success: false,
        message: "You are not the owner of this pet.",
      });
    }

    // Update pet details
    const pet = await Pet.findByIdAndUpdate(
      id,
      {
        name,
        type,
        owner,
        location,
        description,
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Pet details updated successfully!",
      pet,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete pet by validating owner is the same as the one who posted it
router.delete("/pet/delete", async (req, res) => {
  const { id, owner } = req.body;
  try {
    // check all required fields
    if (!id || !owner) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // check if pet exists
    const isPetExist = await Pet.findById(id);
    if (!isPetExist) {
      return res.status(200).json({
        success: false,
        message: "Pet not found.",
      });
    }
    // check if owner is the same as the one who posted it
    if (isPetExist.owner !== owner) {
      return res.status(200).json({
        success: false,
        message: "You are not the owner of this pet.",
      });
    }
    // Delete pet
    await Pet.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Pet deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update lost pet details as admin
router.put("/pet/lost/update/admin", async (req, res) => {
  const { id, name, type, location, date, description } = req.body;
  try {
    // check all required fields
    if (!id || !name || !type || !location || !date || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // check if pet exists

    const isPetExist = await Pet.findById(id);
    if (!isPetExist) {
      return res.status(200).json({
        success: false,
        message: "Pet not found.",
      });
    }

    // Update pet details
    const pet = await Pet.findByIdAndUpdate(
      id,
      {
        name,
        type,
        location,
        date: new Date(date),
        description,
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Pet details updated successfully!",
      pet,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update adopt pet details as admin
router.put("/pet/adopt/update/admin", async (req, res) => {
  const { id, name, type, location, description } = req.body;
  try {
    // check all required fields
    if (!id || !name || !type || !location || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // check if pet exists

    const isPetExist = await Pet.findById(id);
    if (!isPetExist) {
      return res.status(200).json({
        success: false,
        message: "Pet not found.",
      });
    }

    // Update pet details
    const pet = await Pet.findByIdAndUpdate(
      id,
      {
        name,
        type,
        location,
        description,
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Pet details updated successfully!",
      pet,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete pet by admin
router.delete("/pet/delete/admin", async (req, res) => {
  const { id } = req.body;
  try {
    // check all required fields
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }
    // check if pet exists
    const isPetExist = await Pet.findById(id);
    if (!isPetExist) {
      return res.status(200).json({
        success: false,
        message: "Pet not found.",
      });
    }
    // Delete pet
    await Pet.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Pet deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get pet owner name by email
router.get("/user", async (req, res) => {
  const { owner } = req.body;
  try {
    const ownerInfo = await User.findOne({ email: owner });
    if (!ownerInfo) {
      return res.status(200).json({
        success: false,
        message: "User not found.",
      });
    }
    const ownerName = ownerInfo.name;
    res
      .status(200)
      .json({ success: true, name: ownerName || "Name Not Provided" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Email routes for lost and adopt pets
router.post("/email/lost", async (req, res) => {
  const { ownerEmail, senderEmail, senderName, petName, message } = req.body;

  try {
    const ownerInfo = await User.findOne({ email: ownerEmail });
    if (!ownerInfo) {
      return res.status(200).json({
        success: false,
        message: "User not found.",
      });
    }
    const ownerName = ownerInfo.name;
    // check all required fields
    if (
      !ownerEmail ||
      !ownerName ||
      !senderEmail ||
      !senderName ||
      !petName ||
      !message
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // send email to owner and sender
    const result = await sendLostPetEmail(
      ownerEmail,
      ownerName,
      senderEmail,
      senderName,
      petName,
      message
    );

    if (result.success) {
      res.status(200).json({
        success: true,
        message: "Pet lost report sent successfully!",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error sending message.",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/email/adopt", async (req, res) => {
  const { ownerEmail, senderEmail, senderName, petName, message } = req.body;

  try {
    const ownerInfo = await User.findOne({ email: ownerEmail });
    if (!ownerInfo) {
      return res.status(200).json({
        success: false,
        message: "User not found.",
      });
    }
    const ownerName = ownerInfo.name;
    // check all required fields
    if (
      !ownerEmail ||
      !ownerName ||
      !senderEmail ||
      !senderName ||
      !petName ||
      !message
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // send email to owner and sender
    const result = await sendAdoptPetEmail(
      ownerEmail,
      ownerName,
      senderEmail,
      senderName,
      petName,
      message
    );

    if (result.success) {
      res.status(200).json({
        success: true,
        message: "Pet adoption requested successfully!",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error sending message.",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Counts the number of lost and adopt pets and users
router.get("/admin/stats", async (req, res) => {
  try {
    const lostCount = await Pet.countDocuments({ type: "lost" });
    const adoptCount = await Pet.countDocuments({ type: "adopt" });
    const userCount = await User.countDocuments({});
    res.status(200).json({
      success: true,
      stats: {
        user_count: userCount,
        lost_count: lostCount,
        adopt_count: adoptCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- EDGESTORE ROUTER CONFIG ---

const es = initEdgeStore.create();
const edgeStoreRouter = es.router({
  publicFiles: es.fileBucket(),
});

const handler = createEdgeStoreExpressHandler({
  router: edgeStoreRouter,
});

router.get("/edgestore/*", handler);
router.post("/edgestore/*", handler);

export default router;

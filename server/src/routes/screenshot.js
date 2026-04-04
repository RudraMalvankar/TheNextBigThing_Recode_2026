const express = require("express");
const router = express.Router();
const multer = require("multer");
const Screenshot = require("../models/Screenshot");
const { captureScreenshot } = require("../utils/screenshotter");

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

// POST /api/screenshot/capture
router.post("/capture", async (req, res) => {
  const { siteId, page, url } = req.body;
  if (!siteId || !page || !url) {
    return res.status(400).json({ error: "siteId, page, and url are required" });
  }

  try {
    // Try server-side capture first
    const imageBase64 = await captureScreenshot(url);

    const updated = await Screenshot.findOneAndUpdate(
      { siteId, page },
      { 
        siteId, 
        page, 
        url, 
        imageBase64, 
        width: 1280, 
        height: 800,
        capturedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({
      image: imageBase64,
      width: 1280,
      height: 800,
      source: 'captured'
    });
  } catch (error) {
    console.error("[Screenshot] Auto-capture failed:", error.message);
    // Return 202 Accepted to indicate fallback is needed
    res.status(202).json({ 
      image: null, 
      fallback: true,
      error: "Auto-capture failed. Please upload a screenshot manually." 
    });
  }
});

// POST /api/screenshot/upload
router.post("/upload", upload.single("image"), async (req, res) => {
  const { siteId, page } = req.body;
  
  if (!req.file || !siteId || !page) {
    return res.status(400).json({ error: "Missing required fields or file" });
  }

  try {
    const imageBase64 = req.file.buffer.toString("base64");
    
    await Screenshot.findOneAndUpdate(
      { siteId, page },
      { 
        siteId, 
        page, 
        imageBase64, 
        width: 1280, 
        height: 800,
        capturedAt: new Date()
      },
      { upsert: true }
    );

    res.json({ 
      image: imageBase64,
      source: 'uploaded'
    });
  } catch (error) {
    console.error("[Screenshot] Upload failed:", error);
    res.status(500).json({ error: "Failed to save uploaded image" });
  }
});

// GET /api/screenshot/:siteId/:encodedPage
router.get("/:siteId/:encodedPage", async (req, res) => {
  try {
    const { siteId, encodedPage } = req.params;
    const page = decodeURIComponent(encodedPage);

    const existing = await Screenshot.findOne({ siteId, page }).sort({ capturedAt: -1 });

    if (!existing) {
      return res.status(404).json({ error: "Screenshot not found" });
    }

    res.json({
      image: existing.imageBase64,
      width: existing.width,
      height: existing.height,
      capturedAt: existing.capturedAt,
    });
  } catch (error) {
    console.error("Screenshot fetch error:", error);
    res.status(500).json({ error: "Server error fetching screenshot" });
  }
});

module.exports = router;

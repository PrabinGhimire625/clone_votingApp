const express = require("express");
const router = express.Router();
const user = require("./../models/user");
const candidate = require("./../models/candidate");
const { jwtAuthMiddleware } = require("./../jwt");

const checkAdminRole = async (userID) => {
  try {
    const User = await user.findById(userID);
    if (User.role === "admin") {
      return true;
    }
  } catch (err) {
    return false;
  }
};

// Post route to add candidate
router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ error: "Only admin add the candidate! not by user" });

    const data = req.body;
    const newCandidate = new candidate(data);
    const response = await newCandidate.save();
    console.log("Data saved");
    res.status(200).json({ response: response });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Updates the candidate
router.put("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ error: "User has not admin role" });

    const candidateId = req.params.candidateId;
    const updateCandidateData = req.body;
    const response = await candidate.findByIdAndUpdate(
      candidateId,
      updateCandidateData,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!response) {
      return res.status(404).json({ error: "Candidate not found!" });
    }

    console.log("Candidate data is successfully updated!");
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete candidate
router.delete("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ error: "User has not admin role" });

    const candidateId = req.params.candidateId;
    const response = await candidate.findByIdAndDelete(candidateId);
    if (!response) {
      return res.status(404).json({ error: "Candidate not found!" });
    }

    console.log("Candidate data is successfully deleted!");
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start voting user vote to candidate
router.post("/vote/:candidateId", jwtAuthMiddleware, async (req, res) => {
  const candidateId = req.params.candidateId;
  const userId = req.user.id;
  try {
    const Candidate = await candidate.findById(candidateId);
    const User = await user.findById(userId);
    if (!Candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    if (!User) {
      return res.status(404).json({ message: "User not found" });
    }
    if (User.isVoted) {
      return res.status(400).json({ message: "You have already voted" });
    }
    if (User.role === "admin") {
      return res.status(403).json({ message: "Admin is not allowed!" });
    }

    // Update the candidate document to record the vote
    Candidate.votes.push({ user: userId });
    Candidate.voteCount++;
    await Candidate.save();

    // Update the user document
    User.isVoted = true;
    await User.save();

    res.status(200).json({ message: "Vote recorded successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Vote count
router.get("/vote/count", async (req, res) => {
  try {
    // Find all candidates and sort them by voteCount in descending order
    const candidates = await candidate.find().sort({ voteCount: "desc" });

    // Map the candidates to only return their name and voteCount
    const voteRecord = candidates.map((data) => {
      return {
        party: data.party,
        count: data.voteCount,
      };
    });
    return res.status(200).json(voteRecord);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router; // Export to the server.js file

const express = require("express");
const router = express.Router();
const user = require("./../models/user");
const { jwtAuthMiddleware, generateToken } = require("./../jwt");

// post route to add save the data into the database
router.post("/signup", async (req, res) => {
  try {
    const data = req.body; //body parser convert data into javascript obj and store in req.body (user data came on req.body )
    const newuser = new user(data); //Create a new user document/row using the Mongoose model
    const response = await newuser.save(); //save the new user to the database
    console.log("Data saved");
    //to generate token
    const payload = {
      id: response.id,
    };
    const token = generateToken(payload);
    console.log("Token is : ", token);
    res.status(200).json({ response: response, token: token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//login route
router.post("/login", async (req, res) => {
  try {
    const { citizenshipNumber, password } = req.body; //body parser convert data into javascript obj and store in req.body (user data came on req.body )
    const User = await user.findOne({ citizenshipNumber: citizenshipNumber }); //find user by citizenshipNumber
    //if citizenshipNumber or password is not matched, return error
    if (!User || !(await User.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    //generate token
    const payload = {
      id: User.id,
    };
    const token = generateToken(payload);
    res.json({ token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Profile route
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const userData = req.User; //request.User form jwt file
    const userId = userData.id;
    const User = await Person.findById(userId);

    res.status(200).json({ User });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//updates the user password
router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.User; //extract the id from token  ::jwt file
    const { currentPassword, newPassword } = req.body; //extract currentpassword and newPassword form request body

    //find user by userID
    const User = await user.findById(id);
    //if password does not matched, return error
    if (!User || !(await User.comparePassword(currentPassword))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    //update the user password
    User.password=newPassword;
    await user.save();

    console.log("Password updated!");
    res.status(200).json({message : "Password updated"})

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router; //export to the server.js file

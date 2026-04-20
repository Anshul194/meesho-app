const User = require("../models/user");
const jwt = require("jsonwebtoken");


const loginUser = async (req, res) => {
  let { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch {
    const error = new Error("Error! Something went wrong.");
    return res.status(500).json({ message: error.message, success: false });
  }
  if (!existingUser || existingUser.password != password) {
    const error = Error("Wrong details please check at once");
    return res.status(500).json({ message: error.message, success: false });
  }
  let token;
  try {

    token = jwt.sign(
      {
        userId: existingUser.id,
        email: existingUser.email,
        userType: existingUser.userType,
        name: existingUser.name,
      },
    process.env.SECRET,
      { expiresIn: "24h" }
    );
  } catch (err) {
    console.log(err);
    const error = new Error("Error! Something went wrong.");
    return res.status(500).json({ message: error.message, success: false });
  }

  res.status(200).json({
    success: true,
    data: {
      userId: existingUser.id,
      email: existingUser.email,
      token: token,
      userType: existingUser.userType,
      clientId: existingUser.client,
      name: existingUser.name,
    },
  });
};
module.exports = {
  loginUser,
};

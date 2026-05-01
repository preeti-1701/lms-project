import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // check session
    const session = await prisma.session.findFirst({
      where: {
        token,
        isActive: true,
      },
    });

    if (!session) {
      return res.status(401).json({ message: "Session expired" });
    }

    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default auth;
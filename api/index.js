import express, { response } from "express";
import cors from "cors";
import env from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pg from "pg";
import cookieParser from "cookie-parser";
import imageDownloader from "image-downloader";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import multer from "multer";

const app = express();
const port = 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
env.config();

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: process.env.database,
  password: process.env.password,
  port: 5432,
});
db.connect();

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);

app.use(express.json());
app.use(cookieParser());

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use("/uploads", express.static(uploadDir));

app.post("/register", async (req, res) => {
  try {
    const hash = bcrypt.hashSync(req.body.password, 10);

    await db.query(
      "INSERT INTO registration (name,email ,password) VALUES ($1,$2,$3)",
      [req.body.name, req.body.email, hash]
    );
  } catch (err) {
    console.log(err);
  }
});
app.post("/login", async (req, res) => {
  const password = req.body.password;
  const user_id = await db.query(
    "SELECT id FROM registration WHERE email = $1",
    [req.body.email]
  );

  try {
    const result = await db.query(
      "SELECT password,name FROM registration WHERE email = $1",
      [req.body.email]
    );
    const hashedPassword = result.rows[0].password; // Extract the hashed password from the result
    const isPasswordCorrect = bcrypt.compareSync(password, hashedPassword);
    // used to create jwt token and make cookie
    if (isPasswordCorrect) {
      jwt.sign(
        { email: req.body.email, id: user_id.rows[0].id, name: result.rows[0].name },
        process.env.jwtsecret,
        { expiresIn: "1d" },
        (err, token) => {
          if (err) throw err;
          res.cookie("token", token, { httpOnly: true });
          console.log("Token set:", token); // Add this line for logging
          res.status(200).json({
            email: req.body.email,
            id: user_id.rows[0].id,
            name: result.rows[0].name,
          });
        }
      );
    } else {
      console.log("wrong password. try again!");
      res.status(401).json({ error: "Wrong password. Please try again." });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/profile", async (req, res) => {
  const { token } = req.cookies;
  console.log("Received token:", token); // Log the token

  if (!token) {
    return res.status(401).json({ error: "Unauthorized - No Token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.jwtsecret);
    console.log("Decoded token:", decoded); // Log the decoded token

    const result = await db.query(
      "SELECT id, name, email FROM registration WHERE email = $1",
      [decoded.email]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




app.post("/logout", (req, res) => {
  res.cookie("token", " ").json(true);
});

app.post("/upload_by_link", async (req, res) => {
  const { link } = req.body;
  console.log("Received link:", link); // Add this line for debugging

  if (!link) {
    return res.status(400).json({ error: "Link is required" });
  }

  // Validate the URL protocol
  const validProtocols = ["http:", "https:"];
  try {
    const url = new URL(link);
    if (!validProtocols.includes(url.protocol)) {
      return res.status(400).json({
        error: "Invalid URL protocol. Only HTTP and HTTPS are supported.",
      });
    }
  } catch (error) {
    return res.status(400).json({ error: "Invalid URL." });
  }

  const newName = Date.now() + ".jpg";

  try {
    const dest = path.join(uploadDir, newName);
    await imageDownloader.image({
      url: link,
      dest,
    });

    res.json({ name: newName });
    console.log(newName);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to download image" });
  }
});

const uploadMiddleware = multer({ dest: "uploads/" });
app.post("/uploads", uploadMiddleware.array("photos", 100), (req, res) => {
  const uploadedFile = [];

  for (let i = 0; i < req.files.length; i++) {
    const { path, originalname } = req.files[i];
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    const newPath = path + "." + ext;
    fs.renameSync(path, newPath);
    uploadedFile.push(newPath.replace("uploads", ""));
  }

  res.json(uploadedFile);
  console.log(req.files);
});

app.post("/places", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.jwtsecret);

    const userResult = await db.query(
      "SELECT id FROM registration WHERE email = $1",
      [decoded.email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userResult.rows[0].id;

    const {
      title,
      address,
      addedPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
    } = req.body;

    const placeDocu = await db.query(
      "INSERT INTO place (owner, title, adress, photos, description, perks, extra_info, check_in, check_out, max_guests) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
      [
        userId,
        title,
        address,
        addedPhotos,
        description,
        perks,
        extraInfo,
        checkIn,
        checkOut,
        maxGuests,
      ]
    );

    res.status(201).json({ place: placeDocu.rows[0] });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

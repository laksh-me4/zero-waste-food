const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const router = express.Router();


router.post("/register", async (req, res) => {
  const { name, email, phone, age, date_of_birth, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (name, email, phone, age, date_of_birth, password)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [name, email, phone, age, date_of_birth, hashedPassword],
      (err, result) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }

        res.status(201).json({ message: "User registered successfully 💚" });
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});


router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = results[0];
    console.log(results);
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { user_id: user.user_id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful 💚",
      token,
      user_id: user.user_id
    });
  });
});

module.exports = router;
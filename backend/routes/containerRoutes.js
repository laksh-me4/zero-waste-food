const express = require("express");
const db = require("../config/db");

const router = express.Router();

// GET AVAILABLE CONTAINERS
router.get("/", (req, res) => {
  db.query(
    "SELECT * FROM reusable_containers WHERE return_status = 'available'",
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// RETURN CONTAINER
router.post("/return", (req, res) => {
  const { user_id, container_id, order_id } = req.body;

  const insertReturnSql = `
    INSERT INTO returns (user_id, container_id, order_id)
    VALUES (?, ?, ?)
  `;

  db.query(insertReturnSql, [user_id, container_id, order_id], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query(
      "UPDATE reusable_containers SET return_status = 'available' WHERE container_id = ?",
      [container_id],
      (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });

        res.json({ message: "Container returned successfully 💚" });
      }
    );
  });
});

module.exports = router;
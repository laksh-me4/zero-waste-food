const express = require("express");
const db = require("../config/db");

const router = express.Router();


router.get("/", (req, res) => {
  db.query("SELECT * FROM restaurants", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


router.get("/:id/menu", (req, res) => {
  const restId = req.params.id;

  const sql = `
    SELECT * FROM menu_items
    WHERE rest_id = ?
  `;

  db.query(sql, [restId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


router.get("/surplus/all", (req, res) => {
  const sql = `
    SELECT sf.*, m.item_name, r.rest_name
    FROM surplus_food sf
    JOIN menu_items m ON sf.item_id = m.item_id
    JOIN restaurants r ON sf.rest_id = r.rest_id
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.post("/:id/rate", (req, res) => {
  const rest_id = req.params.id;
  const { user_id, order_id, rating, review } = req.body;

  const insertRatingSql = `
    INSERT INTO ratings (user_id, rest_id, order_id, rating, review)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    insertRatingSql,
    [user_id, rest_id, order_id, rating, review],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      
      const avgSql = `
        UPDATE restaurants r
        SET avg_rating = (
          SELECT AVG(rating)
          FROM ratings
          WHERE rest_id = ?
        )
        WHERE r.rest_id = ?
      `;

      db.query(avgSql, [rest_id, rest_id], (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });

        res.json({ message: "Rating submitted 💚" });
      });
    }
  );
});

module.exports = router;
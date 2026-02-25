const express = require("express");
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const router = express.Router();


// =============================
// CREATE ORDER (SECURE VERSION)
// =============================
router.post("/", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  let user_id;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    user_id = decoded.user_id;
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }

  const { rest_id, items, packaging_type, container_id } = req.body;

  const createOrderSql = `
    INSERT INTO orders (user_id, rest_id, packaging_type, container_id)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    createOrderSql,
    [user_id, rest_id, packaging_type, container_id || null],
    (err, orderResult) => {
      if (err) return res.status(500).json({ error: err.message });

      const order_id = orderResult.insertId;

      const orderItemsSql = `
        INSERT INTO order_items (order_id, item_id, quantity, price, is_surplus)
        VALUES ?
      `;

      const values = items.map(item => [
        order_id,
        item.item_id,
        item.quantity,
        item.price,
        item.is_surplus
      ]);

      db.query(orderItemsSql, [values], (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });

        res.json({
          message: "Order placed successfully 💚",
          order_id
        });
      });
    }
  );
});


// =============================
// GET MY ORDERS (SECURE VERSION)
// =============================
router.get("/my", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  let user_id;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    user_id = decoded.user_id;
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }

  const sql = `
    SELECT o.order_id, o.order_status, o.order_date,
           r.rest_name,
           IFNULL(SUM(oi.price * oi.quantity), 0) AS total_amount
    FROM orders o
    JOIN restaurants r ON o.rest_id = r.rest_id
    LEFT JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.user_id = ?
    GROUP BY o.order_id
    ORDER BY o.order_date DESC
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});


module.exports = router;
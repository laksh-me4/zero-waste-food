const express = require("express");
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const router = express.Router();

// ================================
// HELPER — verify token
// ================================
const verifyToken = (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) { res.status(401).json({ error: "No token provided" }); return null; }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.user_id;
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
    return null;
  }
};

// ================================
// POST /api/orders — Place order
// ================================
router.post("/", (req, res) => {
  const user_id = verifyToken(req, res);
  if (!user_id) return;

  const { rest_id, items, packaging_type, container_id, total_amount } = req.body;

  // Step 1: Insert order
  const createOrderSql = `
    INSERT INTO orders (user_id, rest_id, packaging_type, container_id, total_amount)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    createOrderSql,
    [user_id, rest_id, packaging_type, container_id || null, total_amount || 0],
    (err, orderResult) => {
      if (err) return res.status(500).json({ error: err.message });

      const order_id = orderResult.insertId;

      // Step 2: Insert order items
      const orderItemsSql = `
        INSERT INTO order_items (order_id, item_id, quantity, price, is_surplus)
        VALUES ?
      `;

      const values = items.map(item => [
        order_id,
        item.item_id,
        item.quantity,
        item.price,
        item.type === "surplus" ? 1 : 0
      ]);

      db.query(orderItemsSql, [values], (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });

        // Step 3: If reusable, update container status to 'checked-out' ✅ FEATURE 4
        if (packaging_type === "reusable" && container_id) {
          const updateContainerSql = `
            UPDATE reusable_containers 
            SET return_status = 'checked-out' 
            WHERE container_id = ?
          `;
          db.query(updateContainerSql, [container_id], (err3) => {
            if (err3) console.error("Container update error:", err3.message);
            // Don't block the response even if this fails
          });
        }

        res.json({
          message: "Order placed successfully 💚",
          order_id
        });
      });
    }
  );
});

// ================================
// GET /api/orders/my — Get my orders
// ================================
router.get("/my", (req, res) => {
  const user_id = verifyToken(req, res);
  if (!user_id) return;

  const sql = `
    SELECT o.order_id, o.order_status, o.order_date,
           o.packaging_type, o.container_id, o.total_amount,
           r.rest_name
    FROM orders o
    JOIN restaurants r ON o.rest_id = r.rest_id
    WHERE o.user_id = ?
    ORDER BY o.order_date DESC
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ================================
// POST /api/orders/return — Return container ✅ FEATURE 2 & 3
// ================================
router.post("/return", (req, res) => {
  const user_id = verifyToken(req, res);
  if (!user_id) return;

  const { order_id, container_id } = req.body;

  if (!order_id || !container_id) {
    return res.status(400).json({ error: "order_id and container_id are required" });
  }

  // Step 1: Check the order belongs to this user and has reusable packaging
  const checkSql = `
    SELECT * FROM orders 
    WHERE order_id = ? AND user_id = ? AND packaging_type = 'reusable'
  `;

  db.query(checkSql, [order_id, user_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) {
      return res.status(404).json({ error: "Order not found or not a reusable order" });
    }

    // Step 2: Check if already returned
    const alreadyReturnedSql = `SELECT * FROM returns WHERE order_id = ?`;
    db.query(alreadyReturnedSql, [order_id], (err2, returnRows) => {
      if (err2) return res.status(500).json({ error: err2.message });
      if (returnRows.length > 0) {
        return res.status(400).json({ error: "Container already returned for this order" });
      }

      // Step 3: Get deposit amount from container ✅ FEATURE 3
      const containerSql = `SELECT * FROM reusable_containers WHERE container_id = ?`;
      db.query(containerSql, [container_id], (err3, containerRows) => {
        if (err3) return res.status(500).json({ error: err3.message });
        if (containerRows.length === 0) {
          return res.status(404).json({ error: "Container not found" });
        }

        const deposit_amount = containerRows[0].deposit_amount;

        // Step 4: Insert into returns table ✅ FEATURE 3
        const insertReturnSql = `
          INSERT INTO returns (order_id, container_id, user_id, return_date, deposit_refunded)
          VALUES (?, ?, ?, NOW(), ?)
        `;

        db.query(insertReturnSql, [order_id, container_id, user_id, deposit_amount], (err4) => {
          if (err4) return res.status(500).json({ error: err4.message });

          // Step 5: Update container status back to 'available' ✅ FEATURE 4
          const updateContainerSql = `
            UPDATE reusable_containers 
            SET return_status = 'available' 
            WHERE container_id = ?
          `;

          db.query(updateContainerSql, [container_id], (err5) => {
            if (err5) return res.status(500).json({ error: err5.message });

            res.json({
              message: "Container returned successfully! ♻️",
              deposit_refunded: deposit_amount
            });
          });
        });
      });
    });
  });
});

module.exports = router;
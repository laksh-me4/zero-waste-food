const express = require("express");
const db = require("../config/db");

const router = express.Router();


router.post("/", (req, res) => {
  const { order_id, user_id, amount, payment_method } = req.body;

  const transaction_id = "TXN" + Date.now();

  const paymentSql = `
    INSERT INTO payments (order_id, user_id, amount, payment_method, status, transaction_id)
    VALUES (?, ?, ?, ?, 'success', ?)
  `;

  db.query(
    paymentSql,
    [order_id, user_id, amount, payment_method, transaction_id],
    (err, paymentResult) => {
      if (err) return res.status(500).json({ error: err.message });

      const pay_id = paymentResult.insertId;

      const transactionSql = `
        INSERT INTO transactions (pay_id, process, amount)
        VALUES (?, 'completed', ?)
      `;

      db.query(transactionSql, [pay_id, amount], (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });

        
        db.query(
          "UPDATE orders SET order_status = 'confirmed' WHERE order_id = ?",
          [order_id],
          (err3) => {
            if (err3) return res.status(500).json({ error: err3.message });

            res.json({
              message: "Payment successful 💚",
              transaction_id
            });
          }
        );
      });
    }
  );
});

module.exports = router;
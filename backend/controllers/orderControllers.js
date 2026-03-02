const db = require("../config/db");
const jwt = require("jsonwebtoken");


exports.createOrder = async (req, res) => {
  try {
    
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

  
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decoded.user_id;

    const { rest_id, items } = req.body;

    if (!rest_id || !items || items.length === 0) {
      return res.status(400).json({ error: "Invalid order data" });
    }

    
    const [orderResult] = await db.query(
      "INSERT INTO orders (user_id, rest_id, order_status) VALUES (?, ?, 'completed')",
      [user_id, rest_id]
    );

    const orderId = orderResult.insertId;

    
    for (const item of items) {
      await db.query(
        "INSERT INTO order_items (order_id, item_id, quantity, price, is_surplus) VALUES (?, ?, ?, ?, ?)",
        [
          orderId,
          item.item_id,
          item.quantity,
          item.price,
          item.type === "surplus" ? 1 : 0,
        ]
      );
    }

    res.status(201).json({ message: "Order placed successfully" });

  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ error: "Order failed" });
  }
};



exports.getOrdersByUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decoded.user_id;

    const [orders] = await db.query(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC",
      [user_id]
    );

    res.json(orders);

  } catch (error) {
    console.error("Fetch Orders Error:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};
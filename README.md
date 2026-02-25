# 🌿 Zero Waste Food Platform

A full-stack web application that combines food ordering with sustainability features — a **surplus food marketplace** and a **reusable container deposit system** — to help reduce food waste and plastic waste in the restaurant industry.

---

## 📸 Preview

> A food ordering platform with a green purpose.

| Restaurant Listing | Menu with Surplus Section |
|---|---|
| Browse eco-friendly restaurants | Order regular or surplus food |

---

## 🌱 What Makes This Different?

Most food apps just let you order food. This platform goes further:

- **♻️ Surplus Food Marketplace** — Restaurants list near-expiry food at discounted prices instead of throwing it away. Customers get cheaper food. The planet wins.
- **🥡 Reusable Container Scheme** — Users can choose reusable packaging (Steel Box, Glass Jar, Bamboo Bowl) and pay a refundable deposit. Return the container → get your deposit back.
- **🔒 Secure Authentication** — Passwords are never stored in plain text. bcrypt hashing with 10 salt rounds keeps user data safe.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL 8.0 |
| **Authentication** | bcrypt (password hashing) |
| **DB Connector** | mysql2 |
| **API Style** | RESTful API (JSON) |

---

## 📁 Project Structure

```
zero-waste-food-platform/
│
├── public/                  # Frontend files
│   ├── index.html           # Homepage — restaurant listing
│   ├── menu.html            # Restaurant menu page
│   ├── order.html           # Cart & order placement
│   ├── payment.html         # Payment page
│   ├── login.html           # User login
│   ├── register.html        # User registration
│   ├── style.css            # Stylesheet
│   └── script.js            # Frontend JavaScript
│
├── server.js                # Main backend server (Node.js + Express)
├── db.js                    # MySQL connection pool
├── zero_waste.sql           # Database schema + seed data
├── package.json
└── README.md
```

---

## 🗄️ Database Schema

The MySQL database `zero_waste` contains **12 tables**:

```
users               → registered users (bcrypt-hashed passwords)
restaurants         → restaurant listings with ratings
menu_items          → food items (Regular + Surplus categories)
orders              → placed orders (normal or reusable packaging)
order_items         → items within each order (junction table)
payments            → payment records (UPI, Card, Cash)
transactions        → payment processing log
surplus_food        → surplus listings with discounted price + expiry
reusable_containers → eco-friendly container inventory
returns             → container return records
ratings             → user reviews and star ratings
places              → saved delivery addresses
```

### Key Relationships
- `orders.user_id` → `users.user_id`
- `orders.rest_id` → `restaurants.rest_id`
- `orders.container_id` → `reusable_containers.container_id`
- `order_items` is a **junction table** resolving the many-to-many between `orders` and `menu_items`
- `surplus_food.item_id` → `menu_items.item_id`

---

## ⚙️ Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [MySQL](https://dev.mysql.com/downloads/) 8.0
- npm (comes with Node.js)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/zero-waste-food.git
cd zero-waste-food-platform
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up the database
Open MySQL and run:
```bash
mysql -u root -p
```
```sql
CREATE DATABASE zero_waste;
USE zero_waste;
SOURCE zero_waste.sql;
```

### 4. Configure database connection
In `db.js` (or `server.js`), update your MySQL credentials:
```javascript
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'admin',   
  database: 'zero_waste'
});
```

### 5. Start the server
```bash
node server.js
```

### 6. Open in browser
```
http://localhost:3000
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/register` | Register a new user |
| `POST` | `/login` | Login with email + password |
| `GET` | `/restaurants` | Get all restaurants |
| `GET` | `/restaurants/:id/menu` | Get menu for a restaurant |
| `GET` | `/surplus-food` | Get all active surplus listings |
| `POST` | `/orders` | Place a new order |
| `POST` | `/pay` | Process a payment |
| `POST` | `/ratings` | Submit a rating and review |
| `GET` | `/reusable-containers` | Get available containers |
| `POST` | `/returns` | Record a container return |

---

## ✨ Features Walkthrough

### 🍱 Ordering Food
1. Browse restaurants on the homepage
2. Click a restaurant to view its menu
3. Add items to cart
4. Choose packaging: **Normal** or **Reusable Container**
5. Place order → Pay → Get confirmation

### 🥗 Surplus Food
- Surplus items appear in a highlighted section on every menu page
- Discounted prices are shown alongside expiry time
- Once stock runs out, the listing disappears automatically

### ♻️ Reusable Containers
- Choose from Steel Box (₹100), Glass Jar (₹80), or Bamboo Bowl (₹120)
- Deposit is added to your order total
- Return the container → deposit refunded → logged in the `returns` table

### ⭐ Ratings
- After completing an order, submit a star rating (1–5) and a written review
- Restaurant's `avg_rating` is automatically recalculated

---

## 🔒 Security

- Passwords are hashed using **bcrypt** with 10 salt rounds before being stored
- SQL queries use **parameterized statements** (`?` placeholders) to prevent SQL injection
- The plain-text `email` field has a `UNIQUE` constraint to prevent duplicate accounts

---

## 🌍 Sample Data

The database comes pre-loaded with:
- **3 users** (2 with bcrypt-hashed passwords)
- **8 restaurants** across Bangalore, Mumbai, Chennai, Hyderabad, and Pune
- **19 menu items** including Regular and Surplus categories
- **10 surplus food listings** with discounted prices
- **3 reusable container types**
- **22 sample orders**

---

## 🚀 Future Enhancements

- [ ] Real-time surplus expiry countdown timer
- [ ] Restaurant admin dashboard for managing menus
- [ ] Google Maps integration for delivery tracking
- [ ] Loyalty points for choosing reusable packaging
- [ ] Mobile app (React Native / Flutter)
- [ ] Email notifications for order confirmation

---

## 👩‍💻 Author

**Your Name**
- GitHub: [@laksh-me4](https://github.com/laksh-me4)

---

## 📄 License

This project is built as an academic mini project.

---

> *"The greatest threat to our planet is the belief that someone else will save it."*
> Built with 💚 to prove technology can be part of the solution.

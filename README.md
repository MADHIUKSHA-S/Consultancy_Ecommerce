# 🛒 Consultancy Ecommerce – Perundurai Bearings & Mill Stores

A fully functional e-commerce web application developed for **Perundurai Bearings and Mill Stores**, enabling seamless browsing, ordering, and online payments for industrial products. The platform includes a customer portal and an admin dashboard. A chatbot assistant is currently under development.

---

## 🔧 Features

- 🧰 **Product Catalog** – Browse bearings, mill equipment, and accessories
- 🛒 **Shopping Cart & Checkout** – Add to cart, place orders with integrated **online payment**
- 👤 **User Accounts** – Register/login, view order history
- 🛠 **Admin Portal** – Product management, order tracking
- 🤖 **Chatbot (Under Development)** – AI assistant to help users with product queries and FAQs

---

## 🧩 Technology Stack

- **Frontend**: HTML,tailwind CSS, JavaScript 
- **Backend**: Node.js / Express 
- **Database**: MongoDB 
- **Authentication**: JWT 
- **Payment Gateway**: Razorpay 
- **Deployment**: Render

---

## 🚀 How to Run Locally

### 1. Clone the Repository

- git clone https://github.com/MADHIUKSHA-S/Consultancy_Ecommerce.git
- cd Consultancy_Ecommerce

### 2. Install Dependencies

npm install

### 3. Configure Environment Variables
Create a .env file with:
##### backend env
- MONGODB_URI
- PORT
- JWT_SECRET
- JWT_EXPIRES_IN
- JWT_COOKIE_EXPIRES_IN
- ADMIN_EMAIL
- ADMIN_PASSWORD
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_SECRET_KEY
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- EMAIL_USER
- EMAIL_PASS
- FRONTEND_URL

#### //admin env
- VITE_BACKEND_URL

###frontend env
- VITE_RAZORPAY_KEY_ID
- VITE_BACKEND_URL

# Run 
- cd frontend - npm run dev
- cd admin - npm run dev
- cd backend - npm run server

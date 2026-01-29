# Food Delivery System

This project consists of a Node.js/Express Backend and a React/Vite Frontend.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v12 or higher)
- [Git](https://git-scm.com/)

## 1. Database Setup

1.  Open your PostgreSQL tool (pgAdmin, DBeaver, or command line).
2.  Create a new database (e.g., `food_ordering_db`).
3.  Execute the script `database_schema.sql` located in this directory to create tables and relationships.
4.  Open the `.env` file in the root directory and update your database credentials:
    ```env
    DB_HOST=localhost
    DB_USER=postgres
    DB_PASSWORD=your_password
    DB_NAME=food_ordering_db
    DB_PORT=5432
    JWT_SECRET=your_jwt_secret_key
    ```

## 2. Backend Setup (API)

1.  Open a terminal in the project root folder.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the Development Server:
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:5000`.

## 3. Frontend Setup (Client)

1.  Open a **new** terminal.
2.  Navigate to the client folder:
    ```bash
    cd client
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Start the React App:
    ```bash
    npm run dev
    ```
5.  Open your browser and navigate to the URL shown (usually `http://localhost:5173`).

## 4. Testing

To run backend unit tests:

```bash
npm test
```

## Features Implemented

- **Customer**: Browse Restaurants, View Menu, Add to Cart, Register/Login, Checkout (Place Order).
- **Driver**: (API Only) Update Location, Accept Order.
- **Restaurant**: (API Only) Manage Menu, Process Orders.

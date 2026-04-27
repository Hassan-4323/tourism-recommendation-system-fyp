# Tourism Recommendation System FYP

### Data Mining for Favourite and Safe Places Prediction in Tourism Industry

## Project Overview

This Final Year Project (FYP) is a MERN Stack based tourism recommendation platform developed to help users identify tourism destinations that are both **popular** and **safe**.

Unlike traditional tourism platforms that rely mainly on ratings and prices, this system applies **data mining techniques** to analyze:

* **Booking Trends** for destination popularity
* **User Reviews** for sentiment and safety insights
* **Combined Recommendation Logic** for intelligent tourism suggestions

The platform assists travelers in making more informed decisions by recommending destinations based on both **favourite trends** and **safety analysis**.

---

## Key Features

### User Module

* User Registration and Login
* Browse Tourism Packages
* View Detailed Tour Information
* Book Tour Packages
* Submit Reviews and Ratings
* View Booking History

### Admin Module

* Manage Users
* Manage Tourism Packages
* Manage Bookings
* Manage Reviews
* View Dashboard Analytics

### Intelligent Recommendation Module

* Sentiment Analysis on Reviews
* Safety Score Prediction
* Popularity Analysis Using Booking Data
* Favourite and Safe Destination Recommendations

---

## Tech Stack

**Frontend**

* React.js
* CSS / Tailwind CSS

**Backend**

* Node.js
* Express.js

**Database**

* MongoDB

**Other Technologies**

* JWT Authentication
* Bcrypt Password Hashing
* Sentiment Analysis
* Data Mining Logic
* Chart.js / Recharts

---

## System Architecture

The application follows MERN Stack Client-Server Architecture:

* **Frontend:** User Interface built with React.js
* **Backend:** RESTful APIs using Express.js
* **Database:** MongoDB for persistent storage
* **Analytics Layer:** Data Mining & Sentiment Processing

---

## Project Setup

```bash id="9cny7h"
git clone https://github.com/Hassan-4323/tourism-recommendation-system-fyp.git
```

### Backend Setup

```bash id="aaz6kf"
cd server
npm install
npm run dev
```

### Frontend Setup

```bash id="khg03e"
cd client
npm install
npm start
```

---

## Environment Variables

Create a `.env` file in the server directory:

```env id="jywxwo"
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

## Future Enhancements

* AI-Based Personalized Recommendations
* Weather-Based Tour Suggestions
* Hotel and Transport Integration
* Mobile App Development
* Advanced Analytics Dashboard

---

## Academic Details

* **Project Type:** Final Year Project (FYP)
* **Degree Program:** BS Computer Science
* **Domain:** Data Mining / Tourism Recommendation Systems

---

## Author

**Hassan Jan**
MERN Stack Developer
GitHub: https://github.com/Hassan-4323

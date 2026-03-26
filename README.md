# Online Suggestion Box for College Management

A modern web-based system to collect, organize, and manage suggestions and feedback from students, faculty, parents, and administrative staff anonymously.

## 📋 Project Overview

This system digitizes the traditional physical suggestion box with a user-friendly online platform that ensures:
- **Anonymous Submissions** - Users can submit feedback without revealing their identity
- **Easy Organization** - Suggestions categorized by location (Area, Floor, Wing)
- **File Attachments** - Support for image/document uploads
- **Secure Storage** - MongoDB database with secure data management
- **Admin Dashboard** - Manage and respond to suggestions efficiently
- **24/7 Accessibility** - Access from any device with a web browser

## 🛠 Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **File Uploads**: Multer
- **Security**: bcryptjs for password hashing, express-session

## 📦 Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- MongoDB (Local or Atlas)

### Steps

1. **Clone/Extract the project**
   ```bash
   cd "Online suggestion box"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   
   Edit the `.env` file:
   ```
   MONGODB_URI=mongodb://localhost:27017/suggestion_box
   PORT=3000
   NODE_ENV=development
   ```

   For MongoDB Atlas, use:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/suggestion_box
   ```

4. **Start MongoDB**
   
   If running locally:
   ```bash
   mongod
   ```

5. **Create Admin User**
   
   Before starting the server, you can create an admin user. Connect to MongoDB and run:
   ```javascript
   db.admins.insertOne({
     username: "admin",
     password: "$2a$10$...", // hashed password of "admin123"
     email: "admin@college.edu"
   })
   ```

6. **Start the Server**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

7. **Access the Application**
   - **Suggestion Form**: http://localhost:3000
   - **Admin Panel**: http://localhost:3000/admin

## 📖 Usage Guide

### User Side

1. **Submit a Suggestion**
   - Navigate to the home page
   - Fill in the suggestion form with:
     - Suggestion Title (required)
     - Detailed Message (required)
     - Area/Location (required)
     - Floor (optional)
     - Wing/Section (required)
     - Attach image/document (optional)
   - Click "Submit Suggestion"
   - Receive confirmation message

2. **Features**
   - Anonymous submission (no personal information required)
   - File upload support (JPG, PNG, PDF, DOC, DOCX - Max 5MB)
   - Real-time categorization
   - Confirmation message after submission
   - View statistics dashboard

### Admin Side

1. **Login**
   - Go to http://localhost:3000/admin
   - Default credentials:
     - Username: `admin`
     - Password: `admin123`

2. **Dashboard**
   - View statistics overview
   - See total, pending, under review, resolved, and rejected suggestions

3. **Manage Suggestions**
   - **View All**: See all suggestions with pagination
   - **Filter by Status**: Filter by Pending, Under Review, Resolved, Rejected
   - **Filter by Area**: Filter by Library, Cafeteria, Classroom, Hostel, etc.
   - **Search**: Search by title or area

4. **Review & Respond**
   - Click on any suggestion to view details
   - Update status (Pending → Under Review → Resolved/Rejected)
   - Add admin response/comments
   - View attachments
   - Delete suggestions if needed

## 📁 Project Structure

```
Online suggestion box/
├── public/
│   ├── css/
│   │   └── styles.css          # Main stylesheet
│   ├── js/
│   │   ├── main.js             # Main form submission script
│   │   ├── admin-login.js       # Admin login script
│   │   └── admin-dashboard.js   # Admin dashboard script
│   └── uploads/                # User file uploads directory
├── views/
│   ├── index.html              # Suggestion submission page
│   ├── admin.html              # Admin login page
│   ├── admin-dashboard.html    # Admin dashboard
│   └── confirmation.html       # Submission confirmation
├── models/
│   ├── Suggestion.js           # Suggestion schema
│   └── Admin.js                # Admin schema
├── routes/
│   ├── suggestions.js          # Suggestion CRUD routes
│   └── admin.js                # Admin authentication routes
├── config/
│   └── database.js             # MongoDB connection
├── server.js                   # Main server file
├── package.json                # Dependencies
├── .env                        # Environment variables
└── README.md                   # This file
```

## 🔐 Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **Input Validation**: Server-side validation of all inputs
- **File Validation**: Only allowed file types accepted
- **File Size Limit**: 5MB maximum file size
- **Session Management**: Secure session handling
- **Sanitization**: Protection against XSS and injection attacks
- **CORS**: Proper CORS configuration

## 📊 Database Schema

### Suggestion Collection
```javascript
{
  _id: ObjectId,
  title: String (required),
  message: String (required),
  area: String (enum: Library, Cafeteria, Classroom, Hostel, Laboratory, Sports, Other),
  floor: Number (0-10),
  wing: String (enum: A, B, C, D, E, N/A),
  imagePath: String,
  submittedAt: Date,
  status: String (enum: Pending, Under Review, Resolved, Rejected),
  adminResponse: String,
  responseDate: Date
}
```

### Admin Collection
```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  password: String (hashed, required),
  email: String (unique, required),
  createdAt: Date
}
```

## 🎨 Features

- ✅ Responsive Design (Desktop, Tablet, Mobile)
- ✅ Anonymous Submissions
- ✅ File Upload Support
- ✅ Real-time Statistics
- ✅ Advanced Filtering
- ✅ Search Functionality
- ✅ Status Management
- ✅ Admin Comments/Responses
- ✅ Data Validation
- ✅ Error Handling
- ✅ User-Friendly Interface

## 🚀 API Endpoints

### Suggestion Routes
- `POST /api/suggestions/submit` - Submit new suggestion
- `GET /api/suggestions/all` - Get all suggestions
- `GET /api/suggestions/status/:status` - Get by status
- `GET /api/suggestions/area/:area` - Get by area
- `PUT /api/suggestions/update/:id` - Update suggestion
- `DELETE /api/suggestions/delete/:id` - Delete suggestion
- `GET /api/suggestions/stats` - Get statistics

### Admin Routes
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/check-auth` - Check authentication

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- Verify MongoDB credentials if using Atlas

### Port Already in Use
- Change PORT in .env file
- Or kill process using port 3000

### File Upload Issues
- Check /public/uploads directory exists
- Verify file size is under 5MB
- Check allowed file extensions

### Admin Login Issues
- Ensure admin user exists in database
- Check username and password
- Clear browser cookies/cache

## 📝 Notes

- All submissions are completely anonymous
- Admins can view and manage all suggestions
- Suggestions are permanently stored for reference
- Regular backups recommended for MongoDB
- Change default admin credentials in production

## 📞 Support

For issues and questions, refer to the documentation or contact the development team.

## 📄 License

This project is provided for educational purposes.

---

**Happy Feedback! 🎉**

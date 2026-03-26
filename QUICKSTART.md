# 🚀 Quick Start Guide - Online Suggestion Box

## ⚡ 5-Minute Setup

### Step 1: Prerequisites
Before you begin, make sure you have:
- ✅ Node.js installed (https://nodejs.org/)
- ✅ MongoDB installed or MongoDB Atlas account (https://www.mongodb.com/cloud/atlas)

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Setup Environment
Edit the `.env` file in the project root:
```
MONGODB_URI=mongodb://localhost:27017/suggestion_box
PORT=3000
NODE_ENV=development
```

### Step 4: Start MongoDB
**For Local MongoDB:**
```bash
mongod
```

**For MongoDB Atlas:**
Use the connection string from your Atlas dashboard in `.env`

### Step 5: Initialize Admin User
1. Open MongoDB Compass or mongosh
2. Connect to your MongoDB instance
3. Copy and paste commands from `MONGODB_SETUP.js`
4. Or run: 
```bash
mongo < MONGODB_SETUP.js
```

### Step 6: Start the Server
```bash
npm start
```

You'll see:
```
Server running on http://localhost:3000
MongoDB Connected: localhost
```

## 🌐 Access the Application

### User Portal
- **URL**: http://localhost:3000
- **Features**:
  - Submit anonymous suggestions
  - Upload images/documents
  - Categorize by area, floor, wing
  - View submission confirmation

### Admin Panel
- **URL**: http://localhost:3000/admin
- **Login with**:
  - Username: `admin`
  - Password: `admin123`
- **Features**:
  - View all suggestions
  - Filter by status and area
  - Update suggestion status
  - Add admin responses
  - View statistics

## 🎯 Key Features

### User Features
```
✓ Anonymous Submission
✓ File Upload (JPG, PNG, PDF, DOC, DOCX)
✓ Easy Categorization
✓ Confirmation Message
✓ Real-time Stats
✓ Mobile Responsive
```

### Admin Features
```
✓ Dashboard Overview
✓ View All Suggestions
✓ Filter by Status
✓ Filter by Area
✓ Search Suggestions
✓ Update Status
✓ Add Responses
✓ View Attachments
✓ Delete Suggestions
```

## 📝 How to Use

### Submitting a Suggestion (User)
1. Go to http://localhost:3000
2. Fill in:
   - **Suggestion Title** (Required)
   - **Message** (Required, min 10 chars)
   - **Area** (Required)
   - **Floor** (Optional)
   - **Wing** (Required)
   - **Attachment** (Optional, max 5MB)
3. Click "Submit Suggestion"
4. See confirmation page

### Managing Suggestions (Admin)
1. Login at http://localhost:3000/admin
2. Use sidebar to navigate:
   - **Dashboard** - Overview & recent
   - **All Suggestions** - Complete list
   - **Pending** - New suggestions
   - **Under Review** - Being reviewed
   - **Resolved** - Completed
   - **Rejected** - Not applicable
   - **Filter by Area** - Location-based

3. Click any suggestion to:
   - View full details
   - Download attachments
   - Update status
   - Add response
   - Delete if needed

## 🗂 File Structure

```
Online suggestion box/
├── server.js              ← Main server file
├── .env                   ← Configuration
├── package.json           ← Dependencies
├── README.md              ← Full documentation
├── QUICKSTART.md          ← This file
├── public/
│   ├── css/styles.css     ← Styling
│   ├── js/
│   │   ├── main.js        ← User form logic
│   │   ├── admin-login.js ← Admin login
│   │   └── admin-dashboard.js ← Admin panel
│   └── uploads/           ← User files
├── views/
│   ├── index.html         ← User form
│   ├── admin.html         ← Login page
│   ├── admin-dashboard.html ← Dashboard
│   └── confirmation.html  ← Success page
├── models/
│   ├── Suggestion.js      ← Suggestion schema
│   └── Admin.js           ← Admin schema
├── routes/
│   ├── suggestions.js     ← API routes
│   └── admin.js           ← Auth routes
└── config/
    └── database.js        ← DB connection
```

## 🔧 Troubleshooting

### Problem: MongoDB connection refused
**Solution**: 
- Make sure MongoDB service is running
- Check `MONGODB_URI` in `.env`
- Try: `mongod` in terminal

### Problem: Port 3000 already in use
**Solution**:
```bash
# Change PORT in .env file
PORT=3001
# Or kill the process using port 3000
```

### Problem: npm install fails
**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install
```

### Problem: admin login not working
**Solution**:
- Run MongoDB setup commands from `MONGODB_SETUP.js`
- Or create new admin user manually in MongoDB

## 📱 Testing the System

### Test User Flow
1. Go to http://localhost:3000
2. Fill in sample suggestion:
   - Title: "Improve Library Facilities"
   - Message: "The library needs better lighting and more comfortable seating areas"
   - Area: "Library"
   - Wing: "A"
3. Submit and see confirmation

### Test Admin Flow
1. Login at http://localhost:3000/admin
2. View the submitted suggestion
3. Update status to "Under Review"
4. Add response: "Thank you for the suggestion. We are reviewing it."
5. Change status to "Resolved"

## 📊 Database

### Collections Created:
- `suggestions` - All submitted suggestions
- `admins` - Admin users

### Sample Suggestion Document:
```javascript
{
  _id: ObjectId("..."),
  title: "Improve Library",
  message: "Better lighting needed",
  area: "Library",
  floor: 2,
  wing: "A",
  imagePath: "/uploads/suggestion-123456.jpg",
  submittedAt: ISODate("2024-01-15T10:30:00Z"),
  status: "Pending",
  adminResponse: null,
  responseDate: null
}
```

## 🎨 Customization

### Change Colors
Edit `public/css/styles.css`:
```css
:root {
  --primary-color: #2563eb;    /* Change primary color */
  --success-color: #10b981;    /* Change success color */
  --danger-color: #ef4444;     /* Change danger color */
}
```

### Add New Areas
Edit `models/Suggestion.js`:
```javascript
area: {
  type: String,
  enum: ['Library', 'Cafeteria', 'Classroom', 'NewArea'], // Add here
  required: true
}
```

### Change Admin Password
1. Delete current admin from MongoDB
2. Run `MONGODB_SETUP.js` again
3. Or set new password using bcryptjs generator

## 🔐 Production Checklist

Before deploying to production:
- [ ] Change admin default password
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Use MongoDB Atlas for better security
- [ ] Enable HTTPS/SSL
- [ ] Set up regular backups
- [ ] Configure CORS properly
- [ ] Add rate limiting
- [ ] Enable CSRF protection
- [ ] Update secret session key
- [ ] Set up monitoring

## 📞 Need Help?

Refer to:
- `README.md` - Full documentation
- `MONGODB_SETUP.js` - Database setup commands
- API endpoint documentation in README
- Code comments in JavaScript files

## 🎉 You're All Set!

Your Online Suggestion Box is ready to use:
- 👤 Users: http://localhost:3000
- 🔐 Admin: http://localhost:3000/admin (admin/admin123)

Happy coding! 🚀

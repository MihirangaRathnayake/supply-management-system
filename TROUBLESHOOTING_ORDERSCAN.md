# 🔧 OrderScan Troubleshooting Guide

## Issue: Blank Page

If you see a blank page when accessing `/orderscan`, follow these steps:

---

## ✅ Solution Steps

### 1. **Login First** (Most Common Issue)
The OrderScan page is protected and requires authentication.

**Steps:**
1. Navigate to: `http://localhost:5173/login`
2. Login with your credentials:
   - Email: `admin@example.com` (or your admin email)
   - Password: Your password
3. After successful login, navigate to: `http://localhost:5173/orderscan`

---

### 2. **Check Frontend Server**
Make sure the frontend development server is running.

**Steps:**
```bash
# Open terminal in frontend directory
cd frontend

# Start the dev server
npm run dev
```

You should see:
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

### 3. **Check Backend Server**
Make sure the backend API server is running.

**Steps:**
```bash
# Open terminal in backend directory
cd backend

# Start the server
npm start
```

You should see:
```
╔═══════════════════════════════════════════════════════════════╗
║   🚀 Supply Management System API Server                      ║
║   Status:      Running                                        ║
║   Port:        5000                                           ║
╚═══════════════════════════════════════════════════════════════╝
```

---

### 4. **Check Browser Console**
Open browser developer tools to see any JavaScript errors.

**Steps:**
1. Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
2. Click on the **Console** tab
3. Look for any red error messages
4. Share the error message if you need help

---

### 5. **Clear Browser Cache**
Sometimes cached files can cause issues.

**Steps:**
1. Press `Ctrl+Shift+Delete` (Windows) / `Cmd+Shift+Delete` (Mac)
2. Select "Cached images and files"
3. Click "Clear data"
4. Reload the page with `Ctrl+F5` (hard refresh)

---

### 6. **Verify Database Connection**
Make sure Oracle database is running and accessible.

**Check:**
- Oracle database is running
- Connection details in `backend/.env` are correct
- Tables are created (run SQL scripts if needed)

---

### 7. **Check Network Tab**
See if API calls are failing.

**Steps:**
1. Open Developer Tools (`F12`)
2. Click on **Network** tab
3. Reload the page
4. Look for failed requests (red status codes)
5. Check if `/api/purchase-orders` endpoint is accessible

---

## 🐛 Common Errors & Fixes

### Error: "Cannot read property 'user' of undefined"
**Cause:** Not logged in or auth context not available  
**Fix:** Login first at `/login`

### Error: "Failed to load orders"
**Cause:** Backend server not running or database issue  
**Fix:** 
1. Start backend server
2. Check database connection
3. Verify API endpoint is accessible

### Error: "Module not found"
**Cause:** Missing dependencies  
**Fix:**
```bash
cd frontend
npm install
```

### Error: Network request failed
**Cause:** Backend server not running  
**Fix:** Start backend server on port 5000

---

## 🔍 Quick Diagnostic Checklist

Run through this checklist:

- [ ] Frontend server running on port 5173?
- [ ] Backend server running on port 5000?
- [ ] Database connection working?
- [ ] Logged in as a user?
- [ ] Browser console shows no errors?
- [ ] Network tab shows successful API calls?
- [ ] Cache cleared?

---

## 🚀 Quick Start (If Starting Fresh)

### Terminal 1 - Backend
```bash
cd backend
npm install
npm start
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install
npm run dev
```

### Browser
1. Go to: `http://localhost:5173/login`
2. Login with admin credentials
3. Navigate to: `http://localhost:5173/orderscan`

---

## 📞 Still Having Issues?

### Check These Files
1. `frontend/src/App.jsx` - Routing configuration
2. `frontend/src/pages/OrderScanEnhanced.jsx` - Main component
3. `backend/src/routes/purchaseOrder.routes.js` - API routes
4. `backend/.env` - Database configuration

### Get More Info
1. Check browser console for errors
2. Check backend terminal for errors
3. Check network tab for failed requests
4. Verify you're logged in (check localStorage for token)

### Test API Directly
```bash
# Test if backend is accessible
curl http://localhost:5000/health

# Test purchase orders endpoint (replace TOKEN with your JWT)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/purchase-orders
```

---

## ✅ Expected Behavior

When everything works correctly:

1. **Login Page** (`/login`)
   - Shows login form
   - Accepts credentials
   - Redirects to dashboard on success

2. **OrderScan Page** (`/orderscan`)
   - Shows hero header with gradient
   - Shows "Scan Order" button
   - Shows analytics stats (if data exists)
   - Shows order cards grid (if data exists)
   - Shows "Create Sample Orders" button (if admin and no data)

3. **API Calls**
   - `GET /api/purchase-orders` - Returns orders array
   - `GET /api/purchase-orders/analytics` - Returns stats
   - `POST /api/purchase-orders/seed` - Creates sample data (admin only)

---

## 🎯 Most Likely Solution

**90% of blank page issues are because you're not logged in.**

### Quick Fix:
1. Go to: `http://localhost:5173/login`
2. Login
3. Go to: `http://localhost:5173/orderscan`

That's it! 🎉

---

## 📚 Additional Resources

- [ORDERSCAN_QUICKSTART.md](./ORDERSCAN_QUICKSTART.md) - Quick start guide
- [ORDERSCAN_ENHANCED_COMPLETE.md](./ORDERSCAN_ENHANCED_COMPLETE.md) - Full documentation
- [COMPONENT_SHOWCASE.md](./COMPONENT_SHOWCASE.md) - Component usage

---

**Last Updated:** December 2024

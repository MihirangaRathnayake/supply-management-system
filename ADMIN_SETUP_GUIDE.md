# 🔐 Admin Setup Guide

## ✅ Quick Admin Registration

### URLs for Testing

**Frontend (Vite Dev Server):**
- Register: `http://localhost:5173/register`
- Login: `http://localhost:5173/login`
- Dashboard: `http://localhost:5173/`

**Backend API:**
- Base URL: `http://localhost:5000/api`
- Register: `POST http://localhost:5000/api/auth/register`
- Login: `POST http://localhost:5000/api/auth/login`

## 🚀 Create Admin Account

### Step 1: Go to Register Page
```
http://localhost:5173/register
```

### Step 2: Fill in the Form
- **First Name**: Your first name
- **Last Name**: Your last name
- **Email**: admin@example.com (or your email)
- **Password**: admin123 (or your password, min 6 chars)
- **Confirm Password**: admin123 (same as above)
- **Role**: Select **Admin** from dropdown

### Step 3: Click "Create account"
- You'll see: "Account created successfully!"
- Auto-redirects to login page

### Step 4: Login
```
http://localhost:5173/login
```
- **Email**: admin@example.com
- **Password**: admin123
- Check "Remember me" (optional)
- Click "Sign in"

### Step 5: Access Dashboard
- You'll see: "Login successful! Welcome back."
- Redirects to dashboard
- Now you have full ADMIN access!

## 👥 Available Roles

### ADMIN (Full Access)
- ✅ Create, Read, Update, Delete
- ✅ Approve operations
- ✅ Export data
- ✅ Manage users
- ✅ Access all features

### MANAGER (Most Access)
- ✅ Create, Read, Update
- ✅ Approve operations
- ✅ Export data
- ❌ Cannot manage users

### STAFF (Limited Access)
- ✅ Create, Read, Update
- ❌ Cannot approve
- ❌ Cannot export
- ❌ Cannot manage users

### VIEWER (Read Only)
- ✅ Read only
- ❌ Cannot create/update/delete
- ❌ Cannot approve
- ❌ Cannot export

## 🔧 Quick Test Accounts

### Admin Account
```
Email: admin@test.com
Password: admin123
Role: ADMIN
```

### Manager Account
```
Email: manager@test.com
Password: manager123
Role: MANAGER
```

## 🐛 Troubleshooting

### Error: "Role 'VIEWER' is not authorized"
**Solution**: You registered as VIEWER. Register a new account and select ADMIN role.

### Error: "Email already registered"
**Solution**: Use a different email or login with existing credentials.

### Error: "Connection refused"
**Solution**: Make sure backend is running on port 5000.

### Error: "Invalid credentials"
**Solution**: Check email and password are correct.

## 📝 Testing Checklist

### Registration
- [ ] Go to http://localhost:5173/register
- [ ] Fill in all fields
- [ ] Select "Admin" role
- [ ] Click "Create account"
- [ ] See success toast
- [ ] Redirected to login

### Login
- [ ] Go to http://localhost:5173/login
- [ ] Enter email and password
- [ ] Click "Sign in"
- [ ] See success toast
- [ ] Redirected to dashboard

### Dashboard Access
- [ ] Can see dashboard
- [ ] Can access suppliers
- [ ] Can access products
- [ ] Can access warehouses
- [ ] Can create orders
- [ ] No authorization errors

### Profile
- [ ] Click profile picture
- [ ] Click "Edit Profile"
- [ ] Can update profile
- [ ] Can change password
- [ ] Can upload picture

## 🎯 Current Setup

### Default Role
- New registrations now default to **ADMIN**
- Role dropdown available during registration
- Can select: Admin, Manager, Staff, or Viewer

### Permissions
```javascript
ADMIN: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE', 'EXPORT', 'MANAGE_USERS']
MANAGER: ['CREATE', 'READ', 'UPDATE', 'APPROVE', 'EXPORT']
STAFF: ['CREATE', 'READ', 'UPDATE']
VIEWER: ['READ']
```

## 🔐 Security Notes

### Production Recommendations
1. **Remove role selection from public registration**
2. **Only admins should assign roles**
3. **Add email verification**
4. **Add admin approval for new accounts**
5. **Implement invite-only registration**

### For Development/Testing
- ✅ Role selection enabled for easy testing
- ✅ No email verification (faster testing)
- ✅ Instant account creation

## 📱 Quick Commands

### Start Backend
```bash
cd backend
npm start
```

### Start Frontend
```bash
cd frontend
npm run dev
```

### Create Admin via API (Alternative)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@test.com",
    "password": "admin123",
    "role": "ADMIN"
  }'
```

## ✅ You're Ready!

Now you can:
1. Register as ADMIN
2. Login with full access
3. Test all features
4. Create suppliers, products, warehouses
5. Manage the entire system

**Registration URL**: http://localhost:5173/register  
**Login URL**: http://localhost:5173/login  
**Dashboard URL**: http://localhost:5173/

🎉 Happy testing!

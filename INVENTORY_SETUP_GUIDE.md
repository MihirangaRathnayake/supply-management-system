# Inventory Setup Guide

## Issue: Empty Inventory Page

The inventory page shows empty because the INVENTORY table requires existing data in both PRODUCTS and WAREHOUSES tables.

## Quick Fix - Automatic Data Seeding

### Option 1: Use the "Seed Data" Button (Easiest)

1. **Restart your backend server** to load the new seed endpoint
2. Navigate to `http://localhost:5173/inventory`
3. You'll see an empty state with a **"Seed Inventory Data"** button
4. Click the button (Admin only)
5. The system will automatically create inventory records for all products in all warehouses
6. Refresh to see the populated data

### Option 2: Use API Endpoint Directly

If you're an Admin user, you can call the seed endpoint directly:

```bash
# Using curl (replace with your auth token)
curl -X POST http://localhost:5000/api/inventory/seed \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Or using Postman/Thunder Client
POST http://localhost:5000/api/inventory/seed
Headers: Authorization: Bearer YOUR_TOKEN_HERE
```

### Option 3: Manual SQL Script

Run the SQL script in your Oracle database:

```sql
-- File: database/oracle/03_sample_inventory_data.sql
-- This will create inventory for all products in all warehouses
```

## Prerequisites

Before seeding inventory, make sure you have:

1. ✅ **Products created** - At least one product in the PRODUCTS table
2. ✅ **Warehouses created** - At least one warehouse in the WAREHOUSES table

### Check if you have data:

```sql
-- Check products
SELECT COUNT(*) FROM PRODUCTS WHERE STATUS = 'ACTIVE';

-- Check warehouses
SELECT COUNT(*) FROM WAREHOUSES WHERE STATUS = 'ACTIVE';
```

### If you don't have products or warehouses:

1. **Create Products**: Go to `/products` and click "New product"
2. **Create Warehouses**: Go to `/warehouses` and click "New warehouse"
3. **Then seed inventory**: Return to `/inventory` and click "Seed Data"

## What the Seed Function Does

The seed function:
- Finds all active products
- Finds all active warehouses
- Creates an inventory record for each product in each warehouse
- Assigns random quantities (0-500 on hand, 0-50 reserved)
- Skips existing records to avoid duplicates

### Example Output:

```json
{
  "success": true,
  "message": "Inventory seeded successfully",
  "data": {
    "created": 15,
    "skipped": 0,
    "totalProducts": 5,
    "totalWarehouses": 3
  }
}
```

This means: 5 products × 3 warehouses = 15 inventory records created

## Troubleshooting

### "No products found" error
- Create at least one product first at `/products`

### "No warehouses found" error
- Create at least one warehouse first at `/warehouses`

### "Only admin can seed inventory data" error
- You need to be logged in as an ADMIN user
- Check your user role in the profile menu

### Backend not responding
- Make sure your backend server is running
- Restart the backend to load the new seed endpoint
- Check backend console for errors

## Manual Inventory Creation

If you prefer to create inventory manually:

1. Go to `/inventory` tab "All Items"
2. You won't see items until inventory records exist
3. Use the seed function first, then you can adjust quantities

## Database Schema

```
INVENTORY table structure:
- INVENTORY_ID (PK)
- PRODUCT_ID (FK → PRODUCTS)
- WAREHOUSE_ID (FK → WAREHOUSES)
- QUANTITY_ON_HAND
- QUANTITY_RESERVED
- QUANTITY_AVAILABLE (calculated)
- LAST_RECEIVED_AT
- LAST_COUNTED_AT
```

## Next Steps After Seeding

Once inventory is seeded:
1. View the **Overview** tab for analytics
2. Check the **All Items** tab to see all inventory
3. Monitor the **Alerts** tab for low stock items
4. Use **Adjust** button to modify quantities (Admin/Manager only)

---

**Need Help?**
- Check backend console for errors
- Verify database connection
- Ensure Products and Warehouses exist
- Make sure you're logged in as ADMIN

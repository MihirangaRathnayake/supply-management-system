-- ============================================
-- Sample Inventory Data
-- ============================================
-- This script populates the INVENTORY table with sample data
-- Prerequisites: Products and Warehouses must exist

-- Note: Replace the UUIDs below with actual IDs from your PRODUCTS and WAREHOUSES tables
-- You can get these by running:
-- SELECT PRODUCT_ID, SKU, PRODUCT_NAME FROM PRODUCTS;
-- SELECT WAREHOUSE_ID, WAREHOUSE_CODE, WAREHOUSE_NAME FROM WAREHOUSES;

-- Example: Insert inventory records
-- Adjust the IDs based on your actual data

-- Sample inventory entries (you need to replace with actual IDs)
/*
INSERT INTO INVENTORY (INVENTORY_ID, PRODUCT_ID, WAREHOUSE_ID, QUANTITY_ON_HAND, QUANTITY_RESERVED, LAST_RECEIVED_AT)
VALUES (
    SYS_GUID(),
    'your-product-id-here',
    'your-warehouse-id-here',
    100,
    10,
    CURRENT_TIMESTAMP
);
*/

-- To populate inventory automatically for all products in all warehouses:
-- This will create inventory records with random quantities

DECLARE
    v_inventory_id VARCHAR2(36);
BEGIN
    FOR prod IN (SELECT PRODUCT_ID FROM PRODUCTS WHERE STATUS = 'ACTIVE') LOOP
        FOR wh IN (SELECT WAREHOUSE_ID FROM WAREHOUSES WHERE STATUS = 'ACTIVE') LOOP
            -- Check if inventory record already exists
            DECLARE
                v_count NUMBER;
            BEGIN
                SELECT COUNT(*) INTO v_count
                FROM INVENTORY
                WHERE PRODUCT_ID = prod.PRODUCT_ID
                AND WAREHOUSE_ID = wh.WAREHOUSE_ID;
                
                -- Only insert if doesn't exist
                IF v_count = 0 THEN
                    v_inventory_id := SYS_GUID();
                    
                    INSERT INTO INVENTORY (
                        INVENTORY_ID,
                        PRODUCT_ID,
                        WAREHOUSE_ID,
                        QUANTITY_ON_HAND,
                        QUANTITY_RESERVED,
                        LAST_RECEIVED_AT
                    ) VALUES (
                        v_inventory_id,
                        prod.PRODUCT_ID,
                        wh.WAREHOUSE_ID,
                        FLOOR(DBMS_RANDOM.VALUE(0, 500)), -- Random quantity 0-500
                        FLOOR(DBMS_RANDOM.VALUE(0, 50)),  -- Random reserved 0-50
                        CURRENT_TIMESTAMP
                    );
                END IF;
            END;
        END LOOP;
    END LOOP;
    
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Inventory data populated successfully!');
END;
/

-- Verify the data
SELECT 
    i.INVENTORY_ID,
    p.PRODUCT_NAME,
    w.WAREHOUSE_NAME,
    i.QUANTITY_ON_HAND,
    i.QUANTITY_RESERVED
FROM INVENTORY i
JOIN PRODUCTS p ON i.PRODUCT_ID = p.PRODUCT_ID
JOIN WAREHOUSES w ON i.WAREHOUSE_ID = w.WAREHOUSE_ID
ORDER BY p.PRODUCT_NAME, w.WAREHOUSE_NAME;

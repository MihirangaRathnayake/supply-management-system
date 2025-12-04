-- ============================================
-- Supply Management System - Oracle Stored Procedures
-- ============================================
-- Implements atomic, reliable operations for critical supply chain workflows

-- ============================================
-- SP_GENERATE_PO_NUMBER - Generate unique PO number
-- ============================================
CREATE OR REPLACE FUNCTION FN_GENERATE_PO_NUMBER RETURN VARCHAR2 IS
    v_po_number VARCHAR2(30);
BEGIN
    SELECT 'PO-' || TO_CHAR(SYSDATE, 'YYYYMMDD') || '-' || LPAD(SEQ_PO_NUMBER.NEXTVAL, 5, '0')
    INTO v_po_number FROM DUAL;
    RETURN v_po_number;
END;
/

-- ============================================
-- SP_GENERATE_SHIPMENT_NUMBER - Generate unique Shipment number
-- ============================================
CREATE OR REPLACE FUNCTION FN_GENERATE_SHIPMENT_NUMBER RETURN VARCHAR2 IS
    v_ship_number VARCHAR2(30);
BEGIN
    SELECT 'SHP-' || TO_CHAR(SYSDATE, 'YYYYMMDD') || '-' || LPAD(SEQ_SHIPMENT_NUMBER.NEXTVAL, 5, '0')
    INTO v_ship_number FROM DUAL;
    RETURN v_ship_number;
END;
/

-- ============================================
-- SP_CREATE_PURCHASE_ORDER - Create PO with line items
-- ============================================
CREATE OR REPLACE PROCEDURE SP_CREATE_PURCHASE_ORDER(
    p_po_id           IN VARCHAR2,
    p_supplier_id     IN VARCHAR2,
    p_warehouse_id    IN VARCHAR2,
    p_expected_date   IN DATE,
    p_priority        IN VARCHAR2,
    p_notes           IN CLOB,
    p_created_by      IN VARCHAR2,
    p_po_number       OUT VARCHAR2,
    p_result          OUT NUMBER,
    p_message         OUT VARCHAR2
) IS
    v_supplier_exists NUMBER;
    v_warehouse_exists NUMBER;
BEGIN
    -- Validate supplier exists and is active
    SELECT COUNT(*) INTO v_supplier_exists 
    FROM SUPPLIERS WHERE SUPPLIER_ID = p_supplier_id AND STATUS = 'ACTIVE';
    
    IF v_supplier_exists = 0 THEN
        p_result := -1;
        p_message := 'Supplier not found or inactive';
        RETURN;
    END IF;
    
    -- Validate warehouse exists and is active
    SELECT COUNT(*) INTO v_warehouse_exists 
    FROM WAREHOUSES WHERE WAREHOUSE_ID = p_warehouse_id AND STATUS = 'ACTIVE';
    
    IF v_warehouse_exists = 0 THEN
        p_result := -2;
        p_message := 'Warehouse not found or inactive';
        RETURN;
    END IF;
    
    -- Generate PO number
    p_po_number := FN_GENERATE_PO_NUMBER();
    
    -- Create purchase order
    INSERT INTO PURCHASE_ORDERS (
        PO_ID, PO_NUMBER, SUPPLIER_ID, WAREHOUSE_ID, 
        EXPECTED_DATE, PRIORITY, NOTES, CREATED_BY, STATUS
    ) VALUES (
        p_po_id, p_po_number, p_supplier_id, p_warehouse_id,
        p_expected_date, NVL(p_priority, 'NORMAL'), p_notes, p_created_by, 'DRAFT'
    );
    
    p_result := 0;
    p_message := 'Purchase Order created successfully';
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        p_result := -99;
        p_message := 'Error: ' || SQLERRM;
        ROLLBACK;
END;
/

-- ============================================
-- SP_ADD_PO_LINE_ITEM - Add line item to PO
-- ============================================
CREATE OR REPLACE PROCEDURE SP_ADD_PO_LINE_ITEM(
    p_line_item_id    IN VARCHAR2,
    p_po_id           IN VARCHAR2,
    p_product_id      IN VARCHAR2,
    p_quantity        IN NUMBER,
    p_unit_price      IN NUMBER,
    p_notes           IN VARCHAR2,
    p_result          OUT NUMBER,
    p_message         OUT VARCHAR2
) IS
    v_po_status VARCHAR2(30);
    v_line_number NUMBER;
    v_product_exists NUMBER;
BEGIN
    -- Check PO exists and is editable
    SELECT STATUS INTO v_po_status 
    FROM PURCHASE_ORDERS WHERE PO_ID = p_po_id;
    
    IF v_po_status NOT IN ('DRAFT', 'PENDING_APPROVAL') THEN
        p_result := -1;
        p_message := 'Cannot modify PO in status: ' || v_po_status;
        RETURN;
    END IF;
    
    -- Validate product exists
    SELECT COUNT(*) INTO v_product_exists 
    FROM PRODUCTS WHERE PRODUCT_ID = p_product_id AND STATUS = 'ACTIVE';
    
    IF v_product_exists = 0 THEN
        p_result := -2;
        p_message := 'Product not found or inactive';
        RETURN;
    END IF;
    
    -- Get next line number
    SELECT NVL(MAX(LINE_NUMBER), 0) + 1 INTO v_line_number
    FROM PO_LINE_ITEMS WHERE PO_ID = p_po_id;
    
    -- Insert line item
    INSERT INTO PO_LINE_ITEMS (
        LINE_ITEM_ID, PO_ID, PRODUCT_ID, LINE_NUMBER,
        QUANTITY_ORDERED, UNIT_PRICE, NOTES
    ) VALUES (
        p_line_item_id, p_po_id, p_product_id, v_line_number,
        p_quantity, p_unit_price, p_notes
    );
    
    -- Update PO totals
    UPDATE PURCHASE_ORDERS 
    SET SUBTOTAL = (SELECT SUM(QUANTITY_ORDERED * UNIT_PRICE) FROM PO_LINE_ITEMS WHERE PO_ID = p_po_id),
        TOTAL_AMOUNT = SUBTOTAL + TAX_AMOUNT + SHIPPING_COST,
        UPDATED_AT = CURRENT_TIMESTAMP
    WHERE PO_ID = p_po_id;
    
    p_result := 0;
    p_message := 'Line item added successfully';
    
    COMMIT;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_result := -3;
        p_message := 'Purchase Order not found';
        ROLLBACK;
    WHEN OTHERS THEN
        p_result := -99;
        p_message := 'Error: ' || SQLERRM;
        ROLLBACK;
END;
/

-- ============================================
-- SP_APPROVE_PURCHASE_ORDER - Approve or reject PO
-- ============================================
CREATE OR REPLACE PROCEDURE SP_APPROVE_PURCHASE_ORDER(
    p_po_id           IN VARCHAR2,
    p_approved_by     IN VARCHAR2,
    p_action          IN VARCHAR2, -- 'APPROVE' or 'REJECT'
    p_comments        IN VARCHAR2,
    p_result          OUT NUMBER,
    p_message         OUT VARCHAR2
) IS
    v_current_status VARCHAR2(30);
    v_user_role VARCHAR2(20);
    v_line_count NUMBER;
BEGIN
    -- Check user has approval permission
    SELECT ROLE INTO v_user_role FROM USERS WHERE USER_ID = p_approved_by;
    
    IF v_user_role NOT IN ('ADMIN', 'MANAGER') THEN
        p_result := -1;
        p_message := 'User does not have approval permission';
        RETURN;
    END IF;
    
    -- Get current PO status
    SELECT STATUS INTO v_current_status FROM PURCHASE_ORDERS WHERE PO_ID = p_po_id;
    
    IF v_current_status != 'PENDING_APPROVAL' THEN
        p_result := -2;
        p_message := 'PO is not pending approval. Current status: ' || v_current_status;
        RETURN;
    END IF;
    
    -- Check PO has line items
    SELECT COUNT(*) INTO v_line_count FROM PO_LINE_ITEMS WHERE PO_ID = p_po_id;
    IF v_line_count = 0 AND p_action = 'APPROVE' THEN
        p_result := -3;
        p_message := 'Cannot approve PO with no line items';
        RETURN;
    END IF;
    
    -- Update PO status
    IF p_action = 'APPROVE' THEN
        UPDATE PURCHASE_ORDERS
        SET STATUS = 'APPROVED',
            APPROVED_BY = p_approved_by,
            APPROVED_AT = CURRENT_TIMESTAMP,
            NOTES = NOTES || CHR(10) || 'Approval Comment: ' || p_comments,
            UPDATED_AT = CURRENT_TIMESTAMP
        WHERE PO_ID = p_po_id;
        
        p_message := 'Purchase Order approved successfully';
    ELSE
        UPDATE PURCHASE_ORDERS
        SET STATUS = 'REJECTED',
            APPROVED_BY = p_approved_by,
            APPROVED_AT = CURRENT_TIMESTAMP,
            NOTES = NOTES || CHR(10) || 'Rejection Reason: ' || p_comments,
            UPDATED_AT = CURRENT_TIMESTAMP
        WHERE PO_ID = p_po_id;
        
        p_message := 'Purchase Order rejected';
    END IF;
    
    p_result := 0;
    COMMIT;
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_result := -4;
        p_message := 'Purchase Order or User not found';
        ROLLBACK;
    WHEN OTHERS THEN
        p_result := -99;
        p_message := 'Error: ' || SQLERRM;
        ROLLBACK;
END;
/

-- ============================================
-- SP_RECEIVE_SHIPMENT - Process shipment receipt
-- ============================================
CREATE OR REPLACE PROCEDURE SP_RECEIVE_SHIPMENT(
    p_shipment_id     IN VARCHAR2,
    p_received_by     IN VARCHAR2,
    p_result          OUT NUMBER,
    p_message         OUT VARCHAR2
) IS
    v_shipment_status VARCHAR2(30);
    v_po_id VARCHAR2(36);
    v_warehouse_id VARCHAR2(36);
    v_inventory_id VARCHAR2(36);
    v_prev_qty NUMBER;
    
    CURSOR c_items IS
        SELECT SI.SHIPMENT_ITEM_ID, SI.LINE_ITEM_ID, SI.QUANTITY_SHIPPED,
               LI.PRODUCT_ID, LI.UNIT_PRICE
        FROM SHIPMENT_ITEMS SI
        JOIN PO_LINE_ITEMS LI ON SI.LINE_ITEM_ID = LI.LINE_ITEM_ID
        WHERE SI.SHIPMENT_ID = p_shipment_id
        AND SI.CONDITION = 'GOOD';
BEGIN
    -- Get shipment details
    SELECT S.STATUS, S.PO_ID, PO.WAREHOUSE_ID
    INTO v_shipment_status, v_po_id, v_warehouse_id
    FROM INBOUND_SHIPMENTS S
    JOIN PURCHASE_ORDERS PO ON S.PO_ID = PO.PO_ID
    WHERE S.SHIPMENT_ID = p_shipment_id;
    
    IF v_shipment_status = 'DELIVERED' THEN
        p_result := -1;
        p_message := 'Shipment already received';
        RETURN;
    END IF;
    
    -- Process each item
    FOR item IN c_items LOOP
        -- Update line item received quantity
        UPDATE PO_LINE_ITEMS
        SET QUANTITY_RECEIVED = QUANTITY_RECEIVED + item.QUANTITY_SHIPPED,
            STATUS = CASE 
                WHEN QUANTITY_RECEIVED + item.QUANTITY_SHIPPED >= QUANTITY_ORDERED THEN 'RECEIVED'
                ELSE 'PARTIALLY_RECEIVED'
            END,
            UPDATED_AT = CURRENT_TIMESTAMP
        WHERE LINE_ITEM_ID = item.LINE_ITEM_ID;
        
        -- Update shipment item
        UPDATE SHIPMENT_ITEMS
        SET QUANTITY_RECEIVED = item.QUANTITY_SHIPPED
        WHERE SHIPMENT_ITEM_ID = item.SHIPMENT_ITEM_ID;
        
        -- Update or create inventory record
        BEGIN
            SELECT INVENTORY_ID, QUANTITY_ON_HAND 
            INTO v_inventory_id, v_prev_qty
            FROM INVENTORY 
            WHERE PRODUCT_ID = item.PRODUCT_ID AND WAREHOUSE_ID = v_warehouse_id;
            
            UPDATE INVENTORY
            SET QUANTITY_ON_HAND = QUANTITY_ON_HAND + item.QUANTITY_SHIPPED,
                LAST_RECEIVED_AT = CURRENT_TIMESTAMP,
                UPDATED_AT = CURRENT_TIMESTAMP
            WHERE INVENTORY_ID = v_inventory_id;
            
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                v_inventory_id := SYS_GUID();
                v_prev_qty := 0;
                
                INSERT INTO INVENTORY (
                    INVENTORY_ID, PRODUCT_ID, WAREHOUSE_ID, 
                    QUANTITY_ON_HAND, LAST_RECEIVED_AT
                ) VALUES (
                    v_inventory_id, item.PRODUCT_ID, v_warehouse_id,
                    item.QUANTITY_SHIPPED, CURRENT_TIMESTAMP
                );
        END;
        
        -- Record inventory transaction
        INSERT INTO INVENTORY_TRANSACTIONS (
            TRANSACTION_ID, INVENTORY_ID, TRANSACTION_TYPE,
            REFERENCE_TYPE, REFERENCE_ID, QUANTITY,
            PREVIOUS_QTY, NEW_QTY, UNIT_COST, PERFORMED_BY
        ) VALUES (
            SYS_GUID(), v_inventory_id, 'RECEIPT',
            'SHIPMENT', p_shipment_id, item.QUANTITY_SHIPPED,
            v_prev_qty, v_prev_qty + item.QUANTITY_SHIPPED,
            item.UNIT_PRICE, p_received_by
        );
    END LOOP;
    
    -- Update shipment status
    UPDATE INBOUND_SHIPMENTS
    SET STATUS = 'DELIVERED',
        ACTUAL_ARRIVAL = SYSDATE,
        RECEIVED_BY = p_received_by,
        UPDATED_AT = CURRENT_TIMESTAMP
    WHERE SHIPMENT_ID = p_shipment_id;
    
    -- Update PO status
    UPDATE PURCHASE_ORDERS
    SET STATUS = CASE
        WHEN (SELECT COUNT(*) FROM PO_LINE_ITEMS WHERE PO_ID = v_po_id AND STATUS != 'RECEIVED') = 0 
        THEN 'RECEIVED'
        ELSE 'PARTIALLY_RECEIVED'
    END,
    UPDATED_AT = CURRENT_TIMESTAMP
    WHERE PO_ID = v_po_id;
    
    p_result := 0;
    p_message := 'Shipment received successfully';
    COMMIT;
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_result := -2;
        p_message := 'Shipment not found';
        ROLLBACK;
    WHEN OTHERS THEN
        p_result := -99;
        p_message := 'Error: ' || SQLERRM;
        ROLLBACK;
END;
/

-- ============================================
-- SP_ADJUST_INVENTORY - Manual inventory adjustment
-- ============================================
CREATE OR REPLACE PROCEDURE SP_ADJUST_INVENTORY(
    p_inventory_id    IN VARCHAR2,
    p_adjustment_qty  IN NUMBER,
    p_reason          IN VARCHAR2,
    p_performed_by    IN VARCHAR2,
    p_result          OUT NUMBER,
    p_message         OUT VARCHAR2
) IS
    v_prev_qty NUMBER;
    v_new_qty NUMBER;
BEGIN
    -- Get current quantity
    SELECT QUANTITY_ON_HAND INTO v_prev_qty
    FROM INVENTORY WHERE INVENTORY_ID = p_inventory_id;
    
    v_new_qty := v_prev_qty + p_adjustment_qty;
    
    IF v_new_qty < 0 THEN
        p_result := -1;
        p_message := 'Adjustment would result in negative inventory';
        RETURN;
    END IF;
    
    -- Update inventory
    UPDATE INVENTORY
    SET QUANTITY_ON_HAND = v_new_qty,
        UPDATED_AT = CURRENT_TIMESTAMP
    WHERE INVENTORY_ID = p_inventory_id;
    
    -- Record transaction
    INSERT INTO INVENTORY_TRANSACTIONS (
        TRANSACTION_ID, INVENTORY_ID, TRANSACTION_TYPE,
        QUANTITY, PREVIOUS_QTY, NEW_QTY, REASON, PERFORMED_BY
    ) VALUES (
        SYS_GUID(), p_inventory_id, 'ADJUSTMENT',
        p_adjustment_qty, v_prev_qty, v_new_qty, p_reason, p_performed_by
    );
    
    p_result := 0;
    p_message := 'Inventory adjusted successfully';
    COMMIT;
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_result := -2;
        p_message := 'Inventory record not found';
        ROLLBACK;
    WHEN OTHERS THEN
        p_result := -99;
        p_message := 'Error: ' || SQLERRM;
        ROLLBACK;
END;
/

-- ============================================
-- SP_GET_LOW_STOCK_ITEMS - Get items below reorder point
-- ============================================
CREATE OR REPLACE PROCEDURE SP_GET_LOW_STOCK_ITEMS(
    p_warehouse_id    IN VARCHAR2 DEFAULT NULL,
    p_cursor          OUT SYS_REFCURSOR
) IS
BEGIN
    OPEN p_cursor FOR
        SELECT 
            P.PRODUCT_ID,
            P.SKU,
            P.PRODUCT_NAME,
            W.WAREHOUSE_ID,
            W.WAREHOUSE_NAME,
            I.QUANTITY_ON_HAND,
            I.QUANTITY_AVAILABLE,
            P.REORDER_POINT,
            P.REORDER_QTY,
            P.REORDER_POINT - I.QUANTITY_AVAILABLE AS SHORTAGE
        FROM INVENTORY I
        JOIN PRODUCTS P ON I.PRODUCT_ID = P.PRODUCT_ID
        JOIN WAREHOUSES W ON I.WAREHOUSE_ID = W.WAREHOUSE_ID
        WHERE I.QUANTITY_AVAILABLE <= P.REORDER_POINT
        AND P.STATUS = 'ACTIVE'
        AND W.STATUS = 'ACTIVE'
        AND (p_warehouse_id IS NULL OR W.WAREHOUSE_ID = p_warehouse_id)
        ORDER BY SHORTAGE DESC;
END;
/

-- ============================================
-- SP_GET_DASHBOARD_STATS - Get dashboard KPIs
-- ============================================
CREATE OR REPLACE PROCEDURE SP_GET_DASHBOARD_STATS(
    p_total_suppliers     OUT NUMBER,
    p_total_products      OUT NUMBER,
    p_total_warehouses    OUT NUMBER,
    p_pending_orders      OUT NUMBER,
    p_low_stock_count     OUT NUMBER,
    p_total_inventory_value OUT NUMBER
) IS
BEGIN
    SELECT COUNT(*) INTO p_total_suppliers FROM SUPPLIERS WHERE STATUS = 'ACTIVE';
    SELECT COUNT(*) INTO p_total_products FROM PRODUCTS WHERE STATUS = 'ACTIVE';
    SELECT COUNT(*) INTO p_total_warehouses FROM WAREHOUSES WHERE STATUS = 'ACTIVE';
    SELECT COUNT(*) INTO p_pending_orders FROM PURCHASE_ORDERS WHERE STATUS IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT');
    
    SELECT COUNT(*) INTO p_low_stock_count 
    FROM INVENTORY I
    JOIN PRODUCTS P ON I.PRODUCT_ID = P.PRODUCT_ID
    WHERE I.QUANTITY_AVAILABLE <= P.REORDER_POINT AND P.STATUS = 'ACTIVE';
    
    SELECT NVL(SUM(I.QUANTITY_ON_HAND * P.COST_PRICE), 0) INTO p_total_inventory_value
    FROM INVENTORY I
    JOIN PRODUCTS P ON I.PRODUCT_ID = P.PRODUCT_ID
    WHERE P.STATUS = 'ACTIVE';
END;
/

COMMIT;

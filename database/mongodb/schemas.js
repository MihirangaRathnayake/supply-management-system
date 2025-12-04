/**
 * Supply Management System - MongoDB Schema Definitions
 * =======================================================
 * MongoDB is used for flexible, high-volume, and event-driven data
 * including shipment tracking, IoT sensor readings, and audit logs.
 */

// ============================================
// 1. SHIPMENT TRACKING COLLECTION
// ============================================
// Stores real-time shipment events and timeline
const shipmentTrackingSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["shipmentId", "poId", "events", "createdAt"],
      properties: {
        shipmentId: {
          bsonType: "string",
          description: "Reference to Oracle INBOUND_SHIPMENTS.SHIPMENT_ID"
        },
        poId: {
          bsonType: "string",
          description: "Reference to Oracle PURCHASE_ORDERS.PO_ID"
        },
        trackingNumber: {
          bsonType: "string"
        },
        carrier: {
          bsonType: "object",
          properties: {
            name: { bsonType: "string" },
            code: { bsonType: "string" },
            phone: { bsonType: "string" },
            trackingUrl: { bsonType: "string" }
          }
        },
        origin: {
          bsonType: "object",
          properties: {
            address: { bsonType: "string" },
            city: { bsonType: "string" },
            country: { bsonType: "string" },
            coordinates: {
              bsonType: "object",
              properties: {
                lat: { bsonType: "double" },
                lng: { bsonType: "double" }
              }
            }
          }
        },
        destination: {
          bsonType: "object",
          properties: {
            warehouseId: { bsonType: "string" },
            address: { bsonType: "string" },
            city: { bsonType: "string" },
            country: { bsonType: "string" },
            coordinates: {
              bsonType: "object",
              properties: {
                lat: { bsonType: "double" },
                lng: { bsonType: "double" }
              }
            }
          }
        },
        currentLocation: {
          bsonType: "object",
          properties: {
            address: { bsonType: "string" },
            city: { bsonType: "string" },
            country: { bsonType: "string" },
            coordinates: {
              bsonType: "object",
              properties: {
                lat: { bsonType: "double" },
                lng: { bsonType: "double" }
              }
            },
            updatedAt: { bsonType: "date" }
          }
        },
        events: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["eventType", "timestamp", "status"],
            properties: {
              eventType: {
                enum: ["PICKUP", "IN_TRANSIT", "CUSTOMS", "OUT_FOR_DELIVERY", "DELIVERED", "EXCEPTION", "RETURNED"]
              },
              timestamp: { bsonType: "date" },
              status: { bsonType: "string" },
              location: {
                bsonType: "object",
                properties: {
                  address: { bsonType: "string" },
                  city: { bsonType: "string" },
                  country: { bsonType: "string" },
                  coordinates: {
                    bsonType: "object",
                    properties: {
                      lat: { bsonType: "double" },
                      lng: { bsonType: "double" }
                    }
                  }
                }
              },
              description: { bsonType: "string" },
              performedBy: { bsonType: "string" }
            }
          }
        },
        estimatedDelivery: { bsonType: "date" },
        actualDelivery: { bsonType: "date" },
        status: {
          enum: ["PENDING", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "EXCEPTION", "RETURNED"]
        },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
};

// ============================================
// 2. IOT SENSOR READINGS COLLECTION
// ============================================
// Stores temperature, humidity, shock, GPS data from IoT devices
const iotSensorReadingsSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["shipmentId", "deviceId", "readingType", "value", "timestamp"],
      properties: {
        shipmentId: {
          bsonType: "string",
          description: "Reference to shipment being monitored"
        },
        deviceId: {
          bsonType: "string",
          description: "IoT device identifier"
        },
        readingType: {
          enum: ["TEMPERATURE", "HUMIDITY", "SHOCK", "GPS", "LIGHT", "PRESSURE", "TILT"]
        },
        value: {
          bsonType: ["double", "object"],
          description: "Sensor value - double for simple readings, object for complex (GPS)"
        },
        unit: {
          bsonType: "string",
          description: "Unit of measurement (C, %, g, etc.)"
        },
        gpsData: {
          bsonType: "object",
          properties: {
            latitude: { bsonType: "double" },
            longitude: { bsonType: "double" },
            altitude: { bsonType: "double" },
            speed: { bsonType: "double" },
            heading: { bsonType: "double" },
            accuracy: { bsonType: "double" }
          }
        },
        thresholds: {
          bsonType: "object",
          properties: {
            min: { bsonType: "double" },
            max: { bsonType: "double" }
          }
        },
        isAlert: {
          bsonType: "bool",
          description: "True if reading exceeds thresholds"
        },
        alertSeverity: {
          enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
        },
        batteryLevel: {
          bsonType: "double",
          description: "Device battery percentage"
        },
        signalStrength: {
          bsonType: "int",
          description: "Signal strength in dBm"
        },
        timestamp: { bsonType: "date" },
        receivedAt: { bsonType: "date" }
      }
    }
  }
};

// ============================================
// 3. DELIVERY STATUS LOGS COLLECTION
// ============================================
// Detailed delivery milestones and status updates
const deliveryStatusLogsSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["shipmentId", "status", "timestamp"],
      properties: {
        shipmentId: { bsonType: "string" },
        poId: { bsonType: "string" },
        status: {
          enum: [
            "ORDER_PLACED", "ORDER_CONFIRMED", "PREPARING", "READY_FOR_PICKUP",
            "PICKED_UP", "IN_TRANSIT", "AT_HUB", "OUT_FOR_DELIVERY",
            "DELIVERY_ATTEMPTED", "DELIVERED", "EXCEPTION", "RETURNED"
          ]
        },
        previousStatus: { bsonType: "string" },
        timestamp: { bsonType: "date" },
        location: {
          bsonType: "object",
          properties: {
            name: { bsonType: "string" },
            address: { bsonType: "string" },
            city: { bsonType: "string" },
            coordinates: {
              bsonType: "object",
              properties: {
                lat: { bsonType: "double" },
                lng: { bsonType: "double" }
              }
            }
          }
        },
        details: {
          bsonType: "object",
          properties: {
            description: { bsonType: "string" },
            reason: { bsonType: "string" },
            signedBy: { bsonType: "string" },
            signatureImage: { bsonType: "string" },
            photoProof: { bsonType: "array", items: { bsonType: "string" } },
            deliveryInstructions: { bsonType: "string" }
          }
        },
        performedBy: {
          bsonType: "object",
          properties: {
            userId: { bsonType: "string" },
            name: { bsonType: "string" },
            role: { bsonType: "string" }
          }
        },
        metadata: {
          bsonType: "object",
          properties: {
            source: { bsonType: "string" },
            deviceType: { bsonType: "string" },
            appVersion: { bsonType: "string" }
          }
        }
      }
    }
  }
};

// ============================================
// 4. AUDIT LOGS COLLECTION
// ============================================
// Comprehensive user activity tracking
const auditLogsSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["action", "userId", "timestamp"],
      properties: {
        action: {
          enum: [
            "LOGIN", "LOGOUT", "LOGIN_FAILED",
            "CREATE", "READ", "UPDATE", "DELETE",
            "APPROVE", "REJECT", "EXPORT", "IMPORT",
            "PASSWORD_CHANGE", "ROLE_CHANGE", "SETTINGS_CHANGE"
          ]
        },
        userId: { bsonType: "string" },
        userEmail: { bsonType: "string" },
        userRole: { bsonType: "string" },
        resource: {
          bsonType: "object",
          properties: {
            type: {
              enum: ["USER", "SUPPLIER", "PRODUCT", "WAREHOUSE", "INVENTORY", "PURCHASE_ORDER", "SHIPMENT", "SETTINGS"]
            },
            id: { bsonType: "string" },
            name: { bsonType: "string" }
          }
        },
        details: {
          bsonType: "object",
          properties: {
            endpoint: { bsonType: "string" },
            method: { bsonType: "string" },
            requestBody: { bsonType: "object" },
            previousValues: { bsonType: "object" },
            newValues: { bsonType: "object" },
            changedFields: { bsonType: "array", items: { bsonType: "string" } }
          }
        },
        result: {
          bsonType: "object",
          properties: {
            success: { bsonType: "bool" },
            message: { bsonType: "string" },
            errorCode: { bsonType: "string" }
          }
        },
        clientInfo: {
          bsonType: "object",
          properties: {
            ipAddress: { bsonType: "string" },
            userAgent: { bsonType: "string" },
            browser: { bsonType: "string" },
            os: { bsonType: "string" },
            device: { bsonType: "string" }
          }
        },
        timestamp: { bsonType: "date" },
        sessionId: { bsonType: "string" }
      }
    }
  }
};

// ============================================
// 5. NOTIFICATIONS COLLECTION
// ============================================
// System notifications and alerts
const notificationsSchema = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["type", "title", "message", "createdAt"],
      properties: {
        type: {
          enum: ["INFO", "WARNING", "ERROR", "SUCCESS", "ALERT"]
        },
        category: {
          enum: ["INVENTORY", "ORDER", "SHIPMENT", "SYSTEM", "USER"]
        },
        title: { bsonType: "string" },
        message: { bsonType: "string" },
        priority: {
          enum: ["LOW", "NORMAL", "HIGH", "URGENT"]
        },
        recipients: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              userId: { bsonType: "string" },
              read: { bsonType: "bool" },
              readAt: { bsonType: "date" }
            }
          }
        },
        data: {
          bsonType: "object",
          description: "Additional contextual data"
        },
        actions: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              label: { bsonType: "string" },
              url: { bsonType: "string" },
              type: { bsonType: "string" }
            }
          }
        },
        expiresAt: { bsonType: "date" },
        createdAt: { bsonType: "date" }
      }
    }
  }
};

// ============================================
// COLLECTION INDEXES
// ============================================
const indexes = {
  shipment_tracking: [
    { key: { shipmentId: 1 }, unique: true },
    { key: { poId: 1 } },
    { key: { status: 1 } },
    { key: { "events.timestamp": -1 } },
    { key: { createdAt: -1 } }
  ],
  iot_sensor_readings: [
    { key: { shipmentId: 1, timestamp: -1 } },
    { key: { deviceId: 1, timestamp: -1 } },
    { key: { readingType: 1, timestamp: -1 } },
    { key: { isAlert: 1, timestamp: -1 } },
    { key: { timestamp: 1 }, expireAfterSeconds: 7776000 } // 90 days TTL
  ],
  delivery_status_logs: [
    { key: { shipmentId: 1, timestamp: -1 } },
    { key: { status: 1, timestamp: -1 } },
    { key: { timestamp: -1 } }
  ],
  audit_logs: [
    { key: { userId: 1, timestamp: -1 } },
    { key: { action: 1, timestamp: -1 } },
    { key: { "resource.type": 1, "resource.id": 1 } },
    { key: { timestamp: -1 } },
    { key: { timestamp: 1 }, expireAfterSeconds: 31536000 } // 1 year TTL
  ],
  notifications: [
    { key: { "recipients.userId": 1, "recipients.read": 1 } },
    { key: { type: 1, createdAt: -1 } },
    { key: { expiresAt: 1 }, expireAfterSeconds: 0 }
  ]
};

module.exports = {
  shipmentTrackingSchema,
  iotSensorReadingsSchema,
  deliveryStatusLogsSchema,
  auditLogsSchema,
  notificationsSchema,
  indexes
};

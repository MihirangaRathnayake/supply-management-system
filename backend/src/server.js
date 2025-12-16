/**
 * Supply Management System - Express Server
 * ==========================================
 * Main entry point for the backend API
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const {
  initializeDatabases,
  closeDatabases,
  getDbHealth,
} = require("./config/database");

// Import routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const supplierRoutes = require("./routes/supplier.routes");
const productRoutes = require("./routes/product.routes");
const warehouseRoutes = require("./routes/warehouse.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const purchaseOrderRoutes = require("./routes/purchaseOrder.routes");
const shipmentRoutes = require("./routes/shipment.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const auditRoutes = require("./routes/audit.routes");
const settingsRoutes = require("./routes/settings.routes");

// Import middleware
const {
  errorHandler,
  notFoundHandler,
} = require("./middleware/error.middleware");

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Request parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    databases: getDbHealth(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/products", productRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/settings", settingsRoutes);

// API documentation endpoint
app.get("/api", (req, res) => {
  res.json({
    name: "Supply Management System API",
    version: "1.0.0",
    description: "RESTful API for Supply Chain Management",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      suppliers: "/api/suppliers",
      products: "/api/products",
      warehouses: "/api/warehouses",
      inventory: "/api/inventory",
      purchaseOrders: "/api/purchase-orders",
      shipments: "/api/shipments",
      dashboard: "/api/dashboard",
      audit: "/api/audit",
      settings: "/api/settings",
    },
    documentation: "/api/docs",
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

let server;

async function bootstrap() {
  try {
    await initializeDatabases();
    server = app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🚀 Supply Management System API Server                      ║
║                                                               ║
║   Status:      Running                                        ║
║   Port:        ${PORT}                                            ║
║   Environment: ${
        process.env.NODE_ENV || "development"
      }                                  ║
║   API Base:    http://localhost:${PORT}/api                       ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
    });
    return server;
  } catch (error) {
    console.error("Failed to bootstrap application:", error);
    throw error;
  }
}

const gracefulShutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await closeDatabases();
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

if (require.main === module) {
  bootstrap().catch(() => process.exit(1));
}

module.exports = { app, bootstrap };

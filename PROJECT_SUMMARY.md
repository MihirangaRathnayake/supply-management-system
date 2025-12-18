# Supply Management System – Project Summary & Viva Notes

## System Overview
- Purpose: Unified supply chain control for products, inventory, suppliers/warehouses, purchase orders, and shipments. Provides dashboards plus CRUD flows and shipment tracking.
- Data strategy: Oracle stores structured, transactional data (suppliers, products, warehouses, inventory, purchase orders). MongoDB stores flexible/event data (shipments, shipment events, audit logs, settings).
- Outcomes: Users can create/manage purchase orders, adjust inventory, register suppliers/warehouses, and track shipments with live status and milestones.

## Database Integration
- Oracle
  - Stores suppliers, products, warehouses, inventory, purchase orders.
  - Access via `node-oracledb` with SQL CRUD (INSERT/SELECT/UPDATE/DELETE on SUPPLIERS/PRODUCTS/WAREHOUSES/INVENTORY/PURCHASE_ORDERS).
  - Connection pool and helpers in `backend/src/config/database.js` and `backend/src/services/oracle.service.js`.
- MongoDB
  - Stores shipments and event timelines, audit logs, settings (and Mongo-backed POs if used).
  - Access via `mongoose` models (e.g., `shipment.model`, `purchaseOrder.model`, `auditLog.model`).
  - Flexible schemas support appended events and aggregation analytics.
- Connectivity
  - `backend/src/config/database.js` initializes Oracle pool + Mongo connection; `/health` reports both statuses.
  - Oracle CRUD abstracted in `oracle.service.js`; Mongo handled by mongoose models.

## Backend Operations (Node.js + Express)
- Structure: Routes → Controllers → Services/Models. Each resource under `/api/*`.
- Oracle-backed endpoints: suppliers, products, warehouses, inventory, (optionally) purchase orders. Controllers run SQL via `oracle.service.js`.
- Mongo-backed endpoints: shipments (CRUD + analytics + seed), audit logs, settings, purchase orders (Mongo model), with mongoose CRUD/aggregations.
- Consistency: Controllers encapsulate writes; audit logging can mirror Oracle writes into Mongo.
- Auth & roles: JWT middleware (`auth.middleware.js`) protects routes; role gates for mutations/destructive actions.

## Frontend (React + TypeScript Ready)
- UI: React pages for Dashboard, Suppliers, Products, Warehouses, Inventory, Purchase Orders, Shipments, Analytics, Settings.
- Data: React Query for fetching/mutations and cache invalidation; Axios client for HTTP.
- Auth: JWT stored in session/local; Axios interceptor adds `Authorization` and refreshes tokens on 401 via `/api/auth/refresh-token`.
- UX: Modal forms for CRUD, filtering/search, status pills, progress bars, unsaved-changes guard on key forms.

## Technology Integration
- JWT + RBAC: Access tokens secure API calls; refresh tokens extend sessions; middleware enforces roles.
- “Real-time” sync feel: React Query keeps UI in sync (staleTime/refetch/invalidate); optimistic updates can be added for mutations.
- Architecture: React (Vite) → Axios/React Query → Express API → Oracle (structured CRUD) + MongoDB (events/audit/shipments). Vite dev proxy maps `/api` to backend.

## Viva Notes (Key Talking Points)
1) Data split rationale: Oracle for ACID transactional records; Mongo for flexible, append-heavy events/audits.
2) Connectivity: Oracle pool via `node-oracledb`; Mongo via `mongoose`; `/health` surfaces both.
3) Backend layering: routes → controllers → services/models; Oracle CRUD through SQL; Mongo CRUD via mongoose; audit logging after writes.
4) Auth flow: Login issues JWT + refresh; Axios attaches tokens; 401 triggers refresh; middleware enforces roles.
5) Frontend data handling: React Query drives fetch/mutate + cache; Axios client with interceptors; UI reacts to cached data.
6) Shipments: Mongo-backed; analytics via aggregation; events timeline stored per document; add/seed endpoints populate DB.
7) Purchase Orders: Oracle or Mongo-backed (controller/model choice); CRUD + analytics endpoints feed Orders UI.
8) UX: Unsaved-changes guard, modals, filters/search, status badges, progress bars, toast feedback.
9) Why this architecture: Best-fit storage per data shape, clear separation of concerns, secure JWT/RBAC, responsive UI via React Query, easy local dev with Vite proxy.

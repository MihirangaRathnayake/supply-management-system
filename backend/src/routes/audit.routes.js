const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const auditController = require('../controllers/audit.controller');

router.get('/', authenticate, authorize('ADMIN', 'MANAGER'), auditController.listAuditLogs);

module.exports = router;

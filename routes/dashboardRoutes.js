const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { isLoggedIn, restrictTo } = require('../middleware/authMiddleware');

router.use(isLoggedIn);

router.get('/user', dashboardController.getUserDashboard);
router.get('/admin', 
    restrictTo('admin'), 
    dashboardController.getAdminDashboard
);

router.get('/admin/users', restrictTo('admin'), dashboardController.getUserManagement);
router.patch('/admin/users/:id/role', restrictTo('admin'), dashboardController.updateUserRole);
router.get('/support', restrictTo('førsteLinjeSupport', 'andreLinjeSupport'), dashboardController.getSupportDashboard);

module.exports = router;
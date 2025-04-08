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

module.exports = router;
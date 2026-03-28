const express = require('express');
const router = express.Router();
const { 
    createGroup, 
    getGroups, 
    updateGroup, 
    deleteGroup, 
    assignGroupTask 
} = require('../controllers/groupController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);

// Basic CRUD
router.route('/')
    .get(getGroups)
    .post(admin, createGroup);

router.route('/:id')
    .patch(admin, updateGroup)
    .delete(admin, deleteGroup);

// Assigning group-wide tasks
router.post('/:id/tasks', admin, assignGroupTask);

module.exports = router;

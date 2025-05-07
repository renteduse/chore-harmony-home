
const Chore = require('../models/Chore');
const ChoreLog = require('../models/ChoreLog');
const User = require('../models/User');

// @desc    Get all chores for a household
// @route   GET /api/chores
// @access  Private
exports.getChores = async (req, res) => {
  try {
    const { householdId } = req.query;

    // Validate user belongs to this household
    if (req.user.household.toString() !== householdId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view chores for this household'
      });
    }

    // Get all chores for the household
    const chores = await Chore.find({ householdId })
      .populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      data: chores
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Create a new chore
// @route   POST /api/chores
// @access  Private
exports.createChore = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      frequency, 
      assignedTo, 
      householdId,
      nextDueDate 
    } = req.body;

    // Validate user belongs to this household
    if (req.user.household.toString() !== householdId) {
      return res.status(403).json({
        success: false,
        message: 'You can only create chores for your own household'
      });
    }

    // Validate assignedTo user exists and is part of the household
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser || assignedUser.household.toString() !== householdId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user assignment. User must be part of the household'
      });
    }

    const chore = await Chore.create({
      name,
      description,
      frequency,
      assignedTo,
      householdId,
      nextDueDate: new Date(nextDueDate),
      createdBy: req.user.id
    });

    await chore.populate('assignedTo', 'name email');

    res.status(201).json({
      success: true,
      data: chore
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Mark chore as complete
// @route   POST /api/chores/:id/complete
// @access  Private
exports.markChoreComplete = async (req, res) => {
  try {
    // Find chore
    const chore = await Chore.findById(req.params.id);

    if (!chore) {
      return res.status(404).json({
        success: false,
        message: 'Chore not found'
      });
    }

    // Check user belongs to the same household as the chore
    if (req.user.household.toString() !== chore.householdId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this chore'
      });
    }

    // Create a chore log entry
    await ChoreLog.create({
      choreId: chore._id,
      completedBy: req.user.id
    });

    // Update chore status and set next due date based on frequency
    chore.completed = true;
    
    // Calculate next due date
    const nextDueDates = {
      daily: 1,
      weekly: 7,
      biweekly: 14,
      monthly: 30
    };
    
    const days = nextDueDates[chore.frequency] || 7;
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + days);
    
    chore.nextDueDate = nextDate;
    chore.completed = false;
    
    await chore.save();
    
    await chore.populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      data: chore
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get chore logs for household
// @route   GET /api/chores/logs
// @access  Private
exports.getChoreLogs = async (req, res) => {
  try {
    const { householdId } = req.query;

    // Validate user belongs to this household
    if (req.user.household.toString() !== householdId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view logs for this household'
      });
    }

    // Get all chores for the household
    const chores = await Chore.find({ householdId }).select('_id');
    const choreIds = chores.map(chore => chore._id);

    // Find all logs for these chores
    const logs = await ChoreLog.find({ 
      choreId: { $in: choreIds } 
    })
    .populate('choreId', 'name')
    .populate('completedBy', 'name')
    .sort('-completedAt');

    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};


const Household = require('../models/Household');
const User = require('../models/User');

// @desc    Create new household
// @route   POST /api/households
// @access  Private
exports.createHousehold = async (req, res) => {
  try {
    const { name } = req.body;

    // Check if user is already in a household
    if (req.user.household) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of a household'
      });
    }

    // Create household
    const household = await Household.create({
      name,
      owner: req.user.id
    });

    // Update user to be in this household and be the owner
    await User.findByIdAndUpdate(
      req.user.id,
      {
        household: household._id,
        isHouseholdOwner: true
      }
    );

    res.status(201).json({
      success: true,
      data: household
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Join a household
// @route   POST /api/households/join
// @access  Private
exports.joinHousehold = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    // Check if user is already in a household
    if (req.user.household) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of a household'
      });
    }

    // Find household by invite code
    const household = await Household.findOne({ inviteCode });

    if (!household) {
      return res.status(404).json({
        success: false,
        message: 'No household found with that invite code'
      });
    }

    // Add user to household
    await User.findByIdAndUpdate(
      req.user.id,
      {
        household: household._id
      }
    );

    res.status(200).json({
      success: true,
      data: household
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get current user's household
// @route   GET /api/households/current
// @access  Private
exports.getCurrentHousehold = async (req, res) => {
  try {
    // Check if user is in a household
    if (!req.user.household) {
      return res.status(404).json({
        success: false,
        message: 'You are not a member of any household'
      });
    }

    // Get household with members populated
    const household = await Household.findById(req.user.household)
      .populate('members');

    res.status(200).json({
      success: true,
      data: household
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get household members
// @route   GET /api/households/:id/members
// @access  Private
exports.getHouseholdMembers = async (req, res) => {
  try {
    // Check if user is in the requested household
    if (req.user.household.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this household'
      });
    }

    // Get all users in this household
    const members = await User.find({ household: req.params.id });

    res.status(200).json({
      success: true,
      data: members
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

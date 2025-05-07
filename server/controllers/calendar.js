
const Chore = require('../models/Chore');
const Expense = require('../models/Expense');

// @desc    Get calendar events for a household
// @route   GET /api/calendar
// @access  Private
exports.getEvents = async (req, res) => {
  try {
    const { householdId, startDate, endDate } = req.query;

    // Validate user belongs to this household
    if (req.user.household.toString() !== householdId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view calendar for this household'
      });
    }

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get chores due in the date range
    const chores = await Chore.find({
      householdId,
      nextDueDate: {
        $gte: start,
        $lte: end
      }
    }).populate('assignedTo', 'name');

    // Get expenses in the date range
    const expenses = await Expense.find({
      householdId,
      date: {
        $gte: start,
        $lte: end
      }
    });

    // Format chores as calendar events
    const choreEvents = chores.map(chore => ({
      id: `chore-${chore._id}`,
      title: chore.name,
      start: chore.nextDueDate,
      type: 'chore',
      color: '#10b981', // green color
      resourceId: chore.assignedTo._id
    }));

    // Format expenses as calendar events
    const expenseEvents = expenses.map(expense => ({
      id: `expense-${expense._id}`,
      title: `$${expense.amount} - ${expense.description}`,
      start: expense.date,
      type: 'expense',
      color: '#ef4444', // red color
      resourceId: expense.paidBy
    }));

    // Combine all events
    const events = [...choreEvents, ...expenseEvents];

    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

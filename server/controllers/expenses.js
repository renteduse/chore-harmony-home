
const Expense = require('../models/Expense');
const User = require('../models/User');

// @desc    Get all expenses for a household
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res) => {
  try {
    const { householdId } = req.query;

    // Validate user belongs to this household
    if (req.user.household.toString() !== householdId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view expenses for this household'
      });
    }

    // Get all expenses for the household
    const expenses = await Expense.find({ householdId })
      .sort('-date');

    res.status(200).json({
      success: true,
      data: expenses
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private
exports.createExpense = async (req, res) => {
  try {
    const { 
      amount, 
      description, 
      date, 
      participants, 
      householdId 
    } = req.body;

    // Validate user belongs to this household
    if (req.user.household.toString() !== householdId) {
      return res.status(403).json({
        success: false,
        message: 'You can only create expenses for your own household'
      });
    }

    // Create expense
    const expense = await Expense.create({
      amount,
      description,
      date: new Date(date),
      paidBy: req.user.id,
      paidByName: req.user.name,
      participants,
      householdId
    });

    res.status(201).json({
      success: true,
      data: expense
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get balances for a household
// @route   GET /api/expenses/balances
// @access  Private
exports.getBalances = async (req, res) => {
  try {
    const { householdId } = req.query;

    // Validate user belongs to this household
    if (req.user.household.toString() !== householdId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view balances for this household'
      });
    }

    // Get all expenses for this household
    const expenses = await Expense.find({ householdId });
    
    // Get all members of the household
    const members = await User.find({ household: householdId });
    
    // Calculate balances
    const balances = [];
    const debtMap = new Map();
    
    // Initialize debt map
    members.forEach(member => {
      debtMap.set(member._id.toString(), 0);
    });
    
    // Calculate each user's balance
    expenses.forEach(expense => {
      // Add money to the person who paid
      const paidBy = expense.paidBy.toString();
      debtMap.set(paidBy, debtMap.get(paidBy) + expense.amount);
      
      // Subtract from each participant based on their share
      expense.participants.forEach(participant => {
        const userId = participant.userId.toString();
        debtMap.set(userId, debtMap.get(userId) - participant.share);
      });
    });
    
    // Convert map to array of objects
    members.forEach(member => {
      balances.push({
        userId: member._id,
        userName: member.name,
        netBalance: debtMap.get(member._id.toString()) || 0
      });
    });

    res.status(200).json({
      success: true,
      data: balances
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get settlement suggestions for a household
// @route   GET /api/expenses/settlements
// @access  Private
exports.getSettlements = async (req, res) => {
  try {
    const { householdId } = req.query;

    // Validate user belongs to this household
    if (req.user.household.toString() !== householdId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view settlements for this household'
      });
    }

    // Get all balances
    const expenses = await Expense.find({ householdId });
    const members = await User.find({ household: householdId });
    
    // Calculate balances
    const debtMap = new Map();
    
    // Initialize debt map
    members.forEach(member => {
      debtMap.set(member._id.toString(), 0);
    });
    
    // Calculate each user's balance
    expenses.forEach(expense => {
      // Add money to the person who paid
      const paidBy = expense.paidBy.toString();
      debtMap.set(paidBy, debtMap.get(paidBy) + expense.amount);
      
      // Subtract from each participant based on their share
      expense.participants.forEach(participant => {
        const userId = participant.userId.toString();
        debtMap.set(userId, debtMap.get(userId) - participant.share);
      });
    });
    
    // Prepare creditors (positive balance) and debtors (negative balance)
    const creditors = [];
    const debtors = [];
    
    members.forEach(member => {
      const id = member._id.toString();
      const balance = debtMap.get(id) || 0;
      
      if (balance > 0) {
        creditors.push({
          userId: id,
          name: member.name,
          amount: balance
        });
      } else if (balance < 0) {
        debtors.push({
          userId: id,
          name: member.name,
          amount: Math.abs(balance)
        });
      }
    });
    
    // Sort by amount (descending)
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);
    
    // Generate settlements
    const settlements = [];
    
    // Algorithm to minimize number of transactions
    while (debtors.length > 0 && creditors.length > 0) {
      const debtor = debtors[0];
      const creditor = creditors[0];
      
      // Calculate transaction amount (minimum of the two)
      const amount = Math.min(debtor.amount, creditor.amount);
      
      if (amount > 0) {
        settlements.push({
          fromUser: debtor.userId,
          fromUserName: debtor.name,
          toUser: creditor.userId,
          toUserName: creditor.name,
          amount
        });
      }
      
      // Update balances
      debtor.amount -= amount;
      creditor.amount -= amount;
      
      // Remove settled accounts
      if (debtor.amount < 0.01) debtors.shift();
      if (creditor.amount < 0.01) creditors.shift();
    }

    res.status(200).json({
      success: true,
      data: settlements
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

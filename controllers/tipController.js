const Tip = require('../models/Tip');

// קבלת כל הטיפים
const getTips = async (req, res) => {
  try {
    const tips = await Tip.find()
      .populate('author', 'name')
      .sort({ createdAt: -1 });

    res.json(tips);
  } catch (error) {
    res.status(400).json({ message: 'שגיאה בקבלת הטיפים', error: error.message });
  }
};

// יצירת טיפ חדש (אדמין בלבד)
const createTip = async (req, res) => {
  try {
    // בדיקת הרשאות אדמין
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'רק מנהל יכול ליצור טיפים' });
    }

    const { title, content, category } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'כל השדות הם חובה' });
    }

    const tip = await Tip.create({
      title,
      content,
      category,
      author: req.user._id
    });

    const populatedTip = await Tip.findById(tip._id)
      .populate('author', 'name');

    res.status(201).json(populatedTip);
  } catch (error) {
    res.status(400).json({ message: 'שגיאה ביצירת הטיפ', error: error.message });
  }
};

// עדכון טיפ (אדמין בלבד)
const updateTip = async (req, res) => {
  try {
    // בדיקת הרשאות אדמין
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'רק מנהל יכול לערוך טיפים' });
    }

    const { title, content, category } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'כל השדות הם חובה' });
    }

    const tip = await Tip.findById(req.params.id);

    if (!tip) {
      return res.status(404).json({ message: 'הטיפ לא נמצא' });
    }

    const updatedTip = await Tip.findByIdAndUpdate(
      req.params.id,
      { title, content, category },
      { new: true }
    ).populate('author', 'name');

    res.json(updatedTip);
  } catch (error) {
    res.status(400).json({ message: 'שגיאה בעדכון הטיפ', error: error.message });
  }
};

// מחיקת טיפ (אדמין בלבד)
const deleteTip = async (req, res) => {
  try {
    // בדיקת הרשאות אדמין
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'רק מנהל יכול למחוק טיפים' });
    }

    const tip = await Tip.findById(req.params.id);

    if (!tip) {
      return res.status(404).json({ message: 'הטיפ לא נמצא' });
    }

    await Tip.findByIdAndDelete(req.params.id);

    res.json({ message: 'הטיפ נמחק בהצלחה', id: req.params.id });
  } catch (error) {
    res.status(400).json({ message: 'שגיאה במחיקת הטיפ', error: error.message });
  }
};

module.exports = {
  getTips,
  createTip,
  updateTip,
  deleteTip
};

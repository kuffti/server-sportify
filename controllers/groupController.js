const Group = require('../models/Group');
const mongoose = require('mongoose');

// קבלת כל הקבוצות
const getGroups = async (req, res) => {
  try {
    const { sportType } = req.query;
    
    // אם נשלח פרמטר סינון לפי סוג ספורט
    const filter = sportType ? { sportType } : {};
    
    const groups = await Group.find(filter)
      .populate('creator', 'name')
      .populate('participants', 'name')
      .sort({ activityDate: 1 });
      
    res.json(groups);
  } catch (error) {
    console.error('שגיאה בקבלת קבוצות:', error);
    res.status(500).json({ message: 'שגיאה בטעינת הקבוצות', error: error.message });
  }
};

// יצירת קבוצה חדשה
const createGroup = async (req, res) => {
  try {
    const { name, sportType, location, activityDate, activityTime, maxParticipants, description } = req.body;
    
    // בדיקות תקינות
    if (!name || !sportType || !location || !activityDate || !activityTime) {
      return res.status(400).json({ message: 'חסרים פרטים הכרחיים' });
    }
    
    // יצירת קבוצה חדשה
    const group = await Group.create({
      name,
      sportType,
      creator: req.user._id,
      location,
      activityDate,
      activityTime,
      maxParticipants: maxParticipants || 10,
      description: description || '',
      participants: [req.user._id] // יוצר הקבוצה נוסף אוטומטית כמשתתף
    });
    
    // החזרת הקבוצה עם פרטי המשתמש
    const populatedGroup = await Group.findById(group._id)
      .populate('creator', 'name')
      .populate('participants', 'name');
      
    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error('שגיאה ביצירת קבוצה:', error);
    res.status(400).json({ message: 'שגיאה ביצירת הקבוצה', error: error.message });
  }
};

// הצטרפות לקבוצה
const joinGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    
    // בדיקה שה-ID תקין
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'מזהה קבוצה לא תקין' });
    }
    
    // מציאת הקבוצה
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'הקבוצה לא נמצאה' });
    }
    
    // בדיקה אם המשתתף כבר בקבוצה
    if (group.participants.includes(req.user._id)) {
      return res.status(400).json({ message: 'הנך כבר משתתף בקבוצה זו' });
    }
    
    // בדיקה אם הקבוצה מלאה
    if (group.participants.length >= group.maxParticipants) {
      return res.status(400).json({ message: 'הקבוצה מלאה' });
    }
    
    // הוספת המשתמש לקבוצה
    group.participants.push(req.user._id);
    await group.save();
    
    // החזרת הקבוצה המעודכנת
    const updatedGroup = await Group.findById(groupId)
      .populate('creator', 'name')
      .populate('participants', 'name');
      
    res.json(updatedGroup);
  } catch (error) {
    console.error('שגיאה בהצטרפות לקבוצה:', error);
    res.status(400).json({ message: 'שגיאה בהצטרפות לקבוצה', error: error.message });
  }
};

// עזיבת קבוצה
const leaveGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    
    // בדיקת תקינות ה-ID
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'מזהה קבוצה לא תקין' });
    }
    
    // מציאת הקבוצה
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'הקבוצה לא נמצאה' });
    }
    
    // האם המשתמש הוא יוצר הקבוצה?
    if (group.creator.equals(req.user._id)) {
      return res.status(400).json({ message: 'יוצר הקבוצה אינו יכול לעזוב, עליך למחוק את הקבוצה במקום זאת' });
    }
    
    // הסרת המשתמש מרשימת המשתתפים
    if (!group.participants.includes(req.user._id)) {
      return res.status(400).json({ message: 'אינך משתתף בקבוצה זו' });
    }
    
    group.participants = group.participants.filter(
      participant => !participant.equals(req.user._id)
    );
    
    await group.save();
    
    // החזרת הקבוצה המעודכנת
    const updatedGroup = await Group.findById(groupId)
      .populate('creator', 'name')
      .populate('participants', 'name');
      
    res.json(updatedGroup);
  } catch (error) {
    console.error('שגיאה בעזיבת קבוצה:', error);
    res.status(400).json({ message: 'שגיאה בעזיבת הקבוצה', error: error.message });
  }
};

// מחיקת קבוצה (רק ליוצר הקבוצה)
const deleteGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    
    // בדיקת תקינות ה-ID
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'מזהה קבוצה לא תקין' });
    }
    
    // מציאת הקבוצה
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'הקבוצה לא נמצאה' });
    }
    
    // רק יוצר הקבוצה או מנהל מערכת רשאי למחוק
    if (!group.creator.equals(req.user._id) && !req.user.isAdmin) {
      return res.status(403).json({ message: 'אין לך הרשאה למחוק קבוצה זו' });
    }
    
    await Group.findByIdAndDelete(groupId);
    
    res.json({ message: 'הקבוצה נמחקה בהצלחה', id: groupId });
  } catch (error) {
    console.error('שגיאה במחיקת קבוצה:', error);
    res.status(400).json({ message: 'שגיאה במחיקת הקבוצה', error: error.message });
  }
};

module.exports = {
  getGroups,
  createGroup,
  joinGroup,
  leaveGroup,
  deleteGroup
};

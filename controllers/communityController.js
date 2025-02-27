const Community = require('../models/communityModel');

// יצירת פוסט חדש
const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = await Community.create({
      user: req.user.id, // המשתמש שיצר את הפוסט
      title,
      content
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: '😕 שגיאה ביצירת הפוסט' });
  }
};

// קבלת כל הפוסטים
const getPosts = async (req, res) => {
  try {
    const posts = await Community.find()
      .populate('user', 'name') // מביא את שם המשתמש
      .sort({ createdAt: -1 }); // ממיין לפי תאריך יצירה
    res.json(posts);
  } catch (error) {
    res.status(400).json({ message: '😕 שגיאה בקבלת הפוסטים' });
  }
};

// הוספת לייק לפוסט
const likePost = async (req, res) => {
  try {
    const post = await Community.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: '😕 הפוסט לא נמצא' });
    }

    // בודק אם המשתמש כבר לחץ לייק
    if (post.likes.includes(req.user.id)) {
      // מסיר את הלייק
      post.likes = post.likes.filter(id => id.toString() !== req.user.id);
    } else {
      // מוסיף לייק
      post.likes.push(req.user.id);
    }

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(400).json({ message: '😕 שגיאה בעדכון לייק' });
  }
};

module.exports = {
  createPost,
  getPosts,
  likePost
};

const Post = require('../models/Post');

// הוספת קאש בסיסי למניעת עומס
let postsCache = null;
let lastFetchTime = 0;
const CACHE_TTL = 30000; // 30 שניות

// יצירת פוסט חדש
const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = await Post.create({
      title,
      content,
      author: req.user.id,
      createdAt: new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Jerusalem'
      })
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name')
      .populate('comments.user', 'name');

    // איפוס המטמון בעת יצירת פוסט חדש
    postsCache = null;

    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(400).json({ message: 'שגיאה ביצירת הפוסט', error: error.message });
  }
};

// קבלת כל הפוסטים
const getPosts = async (req, res) => {
  try {
    // השתמש במטמון אם קיים ועדיין טרי
    const now = Date.now();
    if (postsCache && now - lastFetchTime < CACHE_TTL) {
      console.log('Returning posts from cache');
      return res.json(postsCache);
    }

    console.log('Fetching posts from DB');
    const posts = await Post.find()
      .populate('author', 'name')
      .populate('comments.user', 'name')
      .sort({ createdAt: -1 });

    // עדכון המטמון
    postsCache = posts;
    lastFetchTime = now;

    // וידוא שכל הנתונים הנדרשים קיימים
    const sanitizedPosts = posts.map(post => ({
      _id: post._id,
      title: post.title,
      content: post.content,
      author: post.author || { name: 'משתמש לא ידוע' },
      likes: post.likes || [],
      comments: post.comments || [],
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }));

    res.json(sanitizedPosts);
  } catch (error) {
    res.status(400).json({ message: 'שגיאה בקבלת הפוסטים', error: error.message });
  }
};

// הוספת/הסרת לייק לפוסט
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'הפוסט לא נמצא' });
    }

    const hasLiked = post.likes.includes(req.user.id);
    if (hasLiked) {
      // הסרת לייק
      post.likes = post.likes.filter(id => id.toString() !== req.user.id);
    } else {
      // הוספת לייק
      post.likes.push(req.user.id);
    }

    await post.save();
    const updatedPost = await Post.findById(post._id)
      .populate('author', 'name')
      .populate('comments.user', 'name');

    res.json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: 'שגיאה בעדכון לייק', error: error.message });
  }
};

// מחיקת פוסט על ידי אדמין
const adminDeletePost = async (req, res) => {
  try {
    // בדיקה שהמשתמש הוא אדמין
    if (!req.user.isAdmin) {
      console.log('Unauthorized attempt to delete post by user:', req.user.id);
      return res.status(403).json({ message: 'אין הרשאת מנהל' });
    }

    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'הפוסט לא נמצא' });
    }

    console.log(`Admin ${req.user.name} deleting post ${post._id}`);
    
    // שימוש ב-findByIdAndDelete במקום ב-remove
    await Post.findByIdAndDelete(req.params.id);
    
    // איפוס המטמון
    postsCache = null;
    
    res.json({ message: 'הפוסט נמחק בהצלחה', id: req.params.id });
  } catch (error) {
    console.error('Error in admin delete post:', error);
    res.status(500).json({ message: 'שגיאה במחיקת הפוסט', error: error.message });
  }
};

// עריכת פוסט על ידי אדמין
const adminEditPost = async (req, res) => {
  try {
    // בדיקה שהמשתמש הוא אדמין
    if (!req.user.isAdmin) {
      console.log('Unauthorized attempt to edit post by user:', req.user.id);
      return res.status(403).json({ message: 'אין הרשאת מנהל' });
    }

    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'כל השדות הם חובה' });
    }

    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'הפוסט לא נמצא' });
    }

    console.log(`Admin ${req.user.name} editing post ${post._id}`);
    
    // עדכון הפוסט
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true }
    ).populate('author', 'name');
    
    // איפוס המטמון כי תוכן השתנה
    postsCache = null;
    
    res.json(updatedPost);
  } catch (error) {
    console.error('Error in admin edit post:', error);
    res.status(500).json({ message: 'שגיאה בעריכת הפוסט', error: error.message });
  }
};

module.exports = {
  createPost,
  getPosts,
  toggleLike,
  adminDeletePost,
  adminEditPost
};

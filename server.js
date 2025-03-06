require('dotenv').config(); // טוען את משתני הסביבה מקובץ .env
const express = require('express'); // ייבוא הספרייה שעוזרת לנו ליצור שרת
const cors = require('cors'); // מאפשר גישה מדפדפנים
const colors = require('colors'); // צובע את ההודעות בקונסול
const connectDB = require('./config/db'); // מייבא את פונקציית החיבור למסד הנתונים

const app = express(); // יוצרים שרת חדש

// מחברים את מסד הנתונים
connectDB();

// הוספת middleware לlogging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`.cyan);
  next();
});

// מגדירים את המידלוורים הבסיסיים
app.use(cors({
  origin: 'http://localhost:3000', // הוספת origin ספציפי
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
})); // מאפשר גישה מהקליינט

app.use(express.json()); // מאפשר לקבל JSON בבקשות
app.use(express.urlencoded({ extended: false })); // מאפשר לקבל נתונים מטפסים

// ייבוא הנתיבים
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const tipRoutes = require('./routes/tipRoutes');
const groupRoutes = require('./routes/groupRoutes');

// הגדרת הנתיבים הראשיים - חשוב להשתמש במשתנים ולא באובייקטים ישירות
app.use('/api/users', userRoutes); 
app.use('/api/posts', postRoutes);
app.use('/api/tips', tipRoutes); 
app.use('/api/groups', groupRoutes);

// הוספת נתיב בדיקה פשוט
app.get('/api/test', (req, res) => {
  res.json({ message: 'The API is working!' });
});

// הדפסת כל הנתיבים שמוגדרים
console.log('===== Available Routes =====');
function printRoutes(stack, basePath = '') {
  stack.forEach(layer => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
      console.log(`${methods} ${basePath}${layer.route.path}`);
    } else if (layer.name === 'router' && layer.handle.stack) {
      let path = layer.regexp.toString()
        .replace('\\^', '')
        .replace('\\/?(?=\\/|$)', '')
        .replace('(?:\\/)?$', '')
        .replace(/\\\//g, '/');
      
      const match = path.match(/^\/\^(\/[^\/]*)\\\/.*/);
      const subPath = match ? match[1] : path;
      
      if (subPath !== '/' && subPath !== '(?:/)?') {
        printRoutes(layer.handle.stack, basePath + subPath);
      } else {
        printRoutes(layer.handle.stack, basePath);
      }
    }
  });
}

// מגדירים את הפורט והמארח
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

// מפעילים את השרת
app.listen(PORT, HOST, () => {
  console.log(`🚀 השרת רץ על http://${HOST}:${PORT}`.yellow.bold);
});

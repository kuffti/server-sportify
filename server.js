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
  credentials: true
})); // מאפשר גישה מכל מקום
app.use(express.json()); // מאפשר לקבל JSON בבקשות
app.use(express.urlencoded({ extended: false })); // מאפשר לקבל נתונים מטפסים

// הוספת תמיכה בCORS נוספת
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// הגדרת הנתיבים הראשיים
app.use('/api/users', require('./routes/userRoutes')); // שינוי הנתיב
app.use('/api/posts', require('./routes/postRoutes')); // שינוי הנתיב
app.use('/api/tips', require('./routes/tipRoutes')); // הוספת נתיב הטיפים

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

// הדפסה מפורטת יותר של הנתיבים
printRoutes(app._router.stack);

// הוספת endpoint לבדיקת נתיבים
app.get('/api/routes', (req, res) => {
  const routes = [];
  
  function extractRoutes(stack, basePath = '') {
    stack.forEach(layer => {
      if (layer.route) {
        routes.push({
          path: basePath + layer.route.path,
          methods: Object.keys(layer.route.methods)
        });
      } else if (layer.name === 'router' && layer.handle.stack) {
        let path = '';
        if (layer.regexp.source !== '^\\/?(?=\\/|$)') {
          path = layer.regexp.toString()
            .replace('\\^', '')
            .replace('\\/?(?=\\/|$)', '')
            .replace('(?:\\/)?$', '')
            .replace(/\\\//g, '/');
          
          if (path.includes('^')) {
            const match = path.match(/^\/\^(\/[^\/]*)\\\/.*/);
            if (match) path = match[1];
          }
        }
        extractRoutes(layer.handle.stack, basePath + path);
      }
    });
  }
  
  extractRoutes(app._router.stack);
  res.json({ routes });
});

// מגדירים את הפורט והמארח
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

// מפעילים את השרת
app.listen(PORT, HOST, () => {
  console.log(`🚀 השרת רץ על http://${HOST}:${PORT}`.yellow.bold);
});

const mongoose = require('mongoose');
require('dotenv').config();
const Tip = require('../models/Tip');

const initialTips = [
  // == טיפי תזונה ==
  {
    title: 'שתו מספיק מים',
    content: 'חשוב לשתות 8-10 כוסות מים ביום, במיוחד כאשר מתאמנים. התייבשות יכולה לפגוע משמעותית בביצועים הספורטיביים שלך ולהאט את קצב חילוף החומרים. קח איתך בקבוק מים לכל מקום והקפד למלא אותו מספר פעמים ביום.',
    category: 'nutrition'
  },
  {
    title: 'חלבון אחרי אימון',
    content: 'צריכת חלבון איכותי בתוך 30-60 דקות מסיום האימון עוזרת לשיקום השרירים ולבנייתם. מקורות מומלצים הם: חזה עוף, טונה, ביצים, יוגורט יווני, קטניות וחלב סויה. אפשר גם לשקול שייק חלבון נוח לשימוש אחרי אימון.',
    category: 'nutrition'
  },
  {
    title: 'אכילה לפני אימון',
    content: 'אכול ארוחה קלה המשלבת פחמימות וקצת חלבון כשעתיים לפני אימון. פחמימות מספקות אנרגיה זמינה בעוד שהחלבון ימנע פירוק שרירים. רעיונות טובים: כריך חביתה, יוגורט עם פירות, או בננה עם מעט חמאת בוטנים.',
    category: 'nutrition'
  },
  {
    title: 'רעיונות לארוחות בריאות',
    content: 'שלב בתפריט שלך מאכלים עשירים בנוגדי חמצון וויטמינים כמו ירקות צבעוניים, פירות טריים, דגים עשירים באומגה 3, אגוזים וזרעים. צמצם מזונות מעובדים, סוכר מזוקק ושומן רווי. הכן מראש ארוחות לשבוע כדי להימנע מאכילה לא מתוכננת.',
    category: 'nutrition'
  },

  // == טיפי אימון ==
  {
    title: 'חימום נכון לפני אימון',
    content: 'הקדישו לפחות 10-15 דקות לחימום דינמי לפני כל אימון. התחילו בפעילות קלה להעלאת דופק (ריצה קלה, קפיצות), והמשיכו עם מתיחות דינמיות. חימום טוב מכין את השרירים והמפרקים, משפר ביצועים ומפחית משמעותית את הסיכון לפציעות.',
    category: 'training'
  },
  {
    title: 'עקרון העומס העולה',
    content: 'כדי להתקדם, יש להגדיל בהדרגה את האינטנסיביות, המשקל או משך האימון. העלה את רמת האתגר ב-5-10% מדי שבוע-שבועיים. זה מאלץ את הגוף להסתגל ולהתחזק. חשוב להאזין לגוף ולא להעמיס יותר מדי כדי למנוע פציעות.',
    category: 'training'
  },
  {
    title: 'אימון מגוון לתוצאות טובות יותר',
    content: 'שלב סוגי אימונים שונים בשגרה השבועית: אימוני כוח, אימוני סיבולת, אימוני הפוגות (HIIT) ואימוני גמישות כמו יוגה. גיוון האימונים מפעיל קבוצות שרירים שונות, מונע קיבעון (plateau), מפחית את הסיכון לפציעות מאימון יתר ושומר על מוטיבציה.',
    category: 'training'
  },
  {
    title: 'תכנון שבועי של האימונים',
    content: 'הכן תכנית אימונים שבועית מראש וקבע זמנים ספציפיים ביומן. למשל: יום א׳ - אימון כוח פלג גוף עליון, יום ג׳ - אימון כוח פלג גוף תחתון, יום ה׳ - קרוספיט, יום ו׳ - ריצה ארוכה. תכנון מראש יעזור לך לשמור על עקביות ולהבטיח אימון מאוזן.',
    category: 'training'
  },

  // == טיפי התאוששות ==
  {
    title: 'שינה איכותית',
    content: 'שינה של 7-9 שעות בלילה חיונית להתאוששות השרירים ולשיפור ביצועים. הגוף מתקן את עצמו בזמן שאתם ישנים, ומפריש הורמון גדילה שמסייע בבניית שרירים. צור שגרת שינה קבועה, הרחק מסכים שעה לפני השינה, וישון בחדר חשוך וקריר.',
    category: 'recovery'
  },
  {
    title: 'אמבטיית קרח להתאוששות מהירה',
    content: 'טבילה במים קרים (10-15 מעלות) למשך 10-15 דקות אחרי אימון אינטנסיבי יכולה להפחית דלקת, לשפר זרימת דם ולזרז התאוששות. אפשר להתחיל עם מקלחות לסירוגין - 30 שניות מים חמים, 30 שניות מים קרים - ולהתרגל בהדרגה.',
    category: 'recovery'
  },
  {
    title: 'מתיחות אחרי אימון',
    content: 'הקדישו 10-15 דקות למתיחות סטטיות אחרי האימון. החזיקו כל מתיחה למשך 30-60 שניות והתמקדו בשרירים שעבדתם. מתיחות משפרות טווח תנועה, מפחיתות כאבי שרירים מושהים (DOMS) ומסייעות לשיקום מהיר יותר.',
    category: 'recovery'
  },
  {
    title: 'תזמון ימי מנוחה',
    content: 'שלב 1-2 ימי מנוחה מלאים בשבוע או ימי אימון קל כמו יוגה או הליכה. המנוחה חיונית להתאוששות, לבניית שרירים ולמניעת פציעות ושחיקה. זכור: התקדמות מתרחשת בזמן המנוחה, לא רק בזמן האימון.',
    category: 'recovery'
  },

  // == טיפי מוטיבציה ==
  {
    title: 'הציבו מטרות ריאליות',
    content: 'קבעו מטרות ספציפיות, מדידות וברות-השגה. למשל, במקום "אני רוצה לרוץ מהר יותר", הציבו מטרה של "אני רוצה לשפר את זמן ריצת 5 ק"מ ב-2 דקות תוך חודשיים". פרקו מטרות גדולות לצעדים קטנים ומדידים וחגגו הצלחות בדרך.',
    category: 'motivation'
  },
  {
    title: 'מצאו חבר לאימונים',
    content: 'התאמנות עם חבר או בקבוצה מעלה משמעותית את הסיכוי להתמיד. קבעו זמני אימון קבועים עם שותף, הצטרפו לקבוצת ריצה או חוג, או שכרו מאמן אישי. האחריותיות והתמיכה ההדדית יעזרו לכם להתמיד גם בימים קשים.',
    category: 'motivation'
  },
  {
    title: 'עקבו אחר ההתקדמות',
    content: 'נהלו יומן אימונים פשוט או השתמשו באפליקציה שמתעדת את האימונים, המשקל, המדידות וההישגים שלכם. מעקב מסודר מאפשר לראות את ההתקדמות לאורך זמן, גם כשהיא איטית. התבוננות בנתונים ותמונות ״לפני ואחרי״ מספקת מוטיבציה אדירה.',
    category: 'motivation'
  },
  {
    title: 'גוונו את האימונים',
    content: 'שגרה היא אויב המוטיבציה. נסו פעילויות חדשות כל כמה שבועות - חוג חדש, אימון בחוץ במקום בחדר הכושר, אימון אינטרוולים במקום ריצה רגילה, או ספורט קבוצתי. גיוון שומר על עניין, מאתגר שרירים חדשים ומונע שחיקה מנטלית.',
    category: 'motivation'
  }
];

async function addInitialTips() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('חיבור למסד הנתונים הצליח.');

    // בדוק אם קיימים כבר טיפים
    const existingTipsCount = await Tip.countDocuments();
    
    if (existingTipsCount > 0) {
      console.log(`ישנם כבר ${existingTipsCount} טיפים במערכת.`);
      
      // שאל את המשתמש אם להוסיף בכל זאת
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      readline.question('האם להוסיף את הטיפים בכל זאת? (כ/ל) ', async (answer) => {
        if (answer.toLowerCase() === 'כ') {
          await Tip.insertMany(initialTips);
          console.log(`נוספו ${initialTips.length} טיפים חדשים בהצלחה!`);
        } else {
          console.log('הפעולה בוטלה.');
        }
        readline.close();
        await mongoose.disconnect();
        console.log('ניתוק ממסד הנתונים.');
      });
      
      return;
    }

    // הוסף את הטיפים ההתחלתיים
    await Tip.insertMany(initialTips);
    console.log(`נוספו ${initialTips.length} טיפים התחלתיים בהצלחה!`);
    
    await mongoose.disconnect();
    console.log('ניתוק ממסד הנתונים.');
  } catch (error) {
    console.error('שגיאה בהוספת טיפים התחלתיים:', error);
    await mongoose.disconnect();
  }
}

addInitialTips();

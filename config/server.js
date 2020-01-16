if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const MongoClient = require('mongodb').MongoClient;
const db_config = require('./database');
const express = require('express');
const server = express();
const cors = require('cors');
const path = require('path');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const methodOverride = require('method-override');
const multer = require('multer');
const QiwiBillPaymentsAPI = require('@qiwi/bill-payments-node-js-sdk');

const qiwiApi = new QiwiBillPaymentsAPI(process.env.QIWI_SECRET_KEY);

MongoClient.connect(db_config.url, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((client) => {
        const db = client.db(db_config.name);
        const storage = multer.diskStorage({
            destination: 'dist/public/img/service-icons',
            filename: function(req, file, cb) {
                cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
            }
        });
    
        // Config
        server.use(cors())
        server.use(express.static(path.join(__dirname, '../dist/public')));
        server.use(multer({storage: storage}).single('img'));
        server.use(express.urlencoded({ extended: false }));
        server.use(express.json());
        server.use(flash());
        server.use(session({secret: process.env.SESSION_SECRET,resave: false,saveUninitialized: false}));
        server.use(passport.initialize());
        server.use(passport.session());
        server.use(methodOverride('_method'));
        server.set('view engine', 'pug');
        server.set('views', path.join(__dirname, '../dist/views'));

        // Routes
        require('./routes/main')(server, db); // маршруты сайта
        require('./routes/admin')(server, db); // маршрут с формой авторизации админа
        require('./routes/control-panel')(server, db); // маршруты с панелью управления
        require('./routes/api')(server, db); // отдача данных клиенту
        
        // Payments
        require('./routes/success')(server, db, qiwiApi);
        require('./routes/payments/qiwi.payment')(server, db, qiwiApi);
    
        // 404 Redirect
        server.use((req, res) => res.status(404).render('main/404'));
    })
    .catch((error) => {
        server.get('*', (req, res) => {
            res.send('Ошибка соединения с БД.');
            console.log(error);
        });
    })
    .finally(() =>  {
        const port = process.env.PORT || 3000;
        server.listen(port, () => {
            console.log('App is running...');
        });
    });

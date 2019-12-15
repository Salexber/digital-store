const ObjectID = require('mongodb').ObjectID;
const fs = require('fs');

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/admin');
}

function indexRoute(req, res, dbo) {
    dbo.collection('categories').find().toArray((err, result) => {
        const categories = result.map(category => category.title[0].toUpperCase() + category.title.slice(1));
        res.render('main/index', {
            pageName: 'index',
            title: 'Digital-Store | Главная',
            categories
        });
    });
}

// API
function getItemsRoute(req, res, dbo) {
    if (req.query.token === 'yYNfW8ynVO18L1TW5qIkILM1WtWgrVZz') {
        if (req.query.items === 'all' && !req.query.category && !req.query.sorting) {
            dbo.collection('items').find().toArray((err, result) => {
                result.length > 0
                    ? res.send(result)
                    : res.send({error: 'Товаров в магазине пока что нет.'});
            });
        } else if (req.query.items === 'all' && req.query.sorting && !req.query.category) {
            if (req.query.sorting === 'ascending') {
                dbo.collection('items').find().sort({price: 1}).toArray((err, result) => {
                    result.length > 0
                    ? res.send(result)
                    : res.send({error: 'Такой категории не существует или там нет товаров.'});
                });
            } else if (req.query.sorting === 'descending') {
                dbo.collection('items').find().sort({price: -1}).toArray((err, result) => {
                    result.length > 0
                    ? res.send(result)
                    : res.send({error: 'Такой категории не существует или там нет товаров.'});
                });
            } else if (req.query.sorting === 'newer') {
                dbo.collection('items').find().sort({date: -1}).toArray((err, result) => {
                    result.length > 0
                    ? res.send(result)
                    : res.send({error: 'Такой категории не существует или там нет товаров.'});
                });
            } else if (req.query.sorting === 'older') {
                dbo.collection('items').find().sort({date: 1}).toArray((err, result) => {
                    result.length > 0
                    ? res.send(result)
                    : res.send({error: 'Такой категории не существует или там нет товаров.'});
                });
            } else {
                res.send('Введите параметр по убыванию или возрастанию.');
            }
        } else if (req.query.items === 'all' && req.query.category && !req.query.sorting) {
            dbo.collection('items').find({category: req.query.category}).toArray((err, result) => {
                result.length > 0
                    ? res.send(result)
                    : res.send({error: 'Такой категории не существует или там нет товаров.'});
            });
        } else if (req.query.items === 'all' && req.query.category && req.query.sorting) {
            if (req.query.sorting === 'ascending') {
                dbo.collection('items').find({category: req.query.category}).sort({price: 1}).toArray((err, result) => {
                    result.length > 0
                    ? res.send(result)
                    : res.send({error: 'Такой категории не существует или там нет товаров.'});
                });
            } else if (req.query.sorting === 'descending') {
                dbo.collection('items').find({category: req.query.category}).sort({price: -1}).toArray((err, result) => {
                    result.length > 0
                    ? res.send(result)
                    : res.send({error: 'Такой категории не существует или там нет товаров.'});
                });
            } else if (req.query.sorting === 'newer') {
                dbo.collection('items').find({category: req.query.category}).sort({date: -1}).toArray((err, result) => {
                    result.length > 0
                    ? res.send(result)
                    : res.send({error: 'Такой категории не существует или там нет товаров.'});
                });
            } else if (req.query.sorting === 'older') {
                dbo.collection('items').find({category: req.query.category}).sort({date: 1}).toArray((err, result) => {
                    result.length > 0
                    ? res.send(result)
                    : res.send({error: 'Такой категории не существует или там нет товаров.'});
                });
            } else {
                res.send('Введите параметр по убыванию или возрастанию.');
            }
        } else if (req.query.categories === 'all') {
            dbo.collection('categories').find().toArray((err, result) => {
                result.length > 0
                    ? res.send(result)
                    : res.send({error: 'На сайте нету категорий'});
            });
        } else if (req.query.icons === 'all') {
            const icons = fs.readdirSync('dist/public/img/service-icons');
            res.send(icons);
        } else if (req.query.category) {
            dbo.collection('categories').find({title: req.query.category}).toArray((err, result) => {
                res.send(result);
            });
        } else {
            res.send('Запрос неверный.');
        }
    } else {
        res.send('Неверный токен.');
    }
}

function onePageItemRoute(req, res, dbo) {
    try {
        dbo.collection('items').find({_id: ObjectID(req.params.id)}).toArray((err, result) => {
            const item = result[0];
            try {
                dbo.collection('categories').find({title: item.category}).toArray((err, result) => {
                    const category = result[0];
                    res.render('main/product', {
                        title: item.title,
                        image: category.img,
                        count: item.count,
                        category: item.category[0].toUpperCase() + item.category.slice(1),
                        price: item.price,
                        description: item.description,
                        date: item.date,
                        id: item._id,
                        type: category.type,
                        format: category.format
                    })
                });
            } catch {
                res.render('main/404');
            }
        })
    } catch {
        res.render('main/404');
    }
}

function howToBuyRoute(req, res) {
    res.render('main/how-to-buy', {
        pageName: 'how-to-buy',
        title: 'Digital-Store | Как купить товар'
    });
}

function contactsRoute(req, res) {
    res.render('main/contacts', {
        pageName: 'contacts',
        title: 'Digital-Store | Контакты'
    });
}

function commentsRoute(req, res) {
    res.render('main/comments', {
        pageName: 'comments',
        title: 'Digital-Store | Отзывы'
    });
}

function myOrdersRoute(req, res) {
    res.render('main/my-orders', {
        pageName: 'my-orders',
        title: 'Digital-Store | Мои покупки'
    });
}

function controlPanelRoute(req, res) {
    res.render('admin/control-panel', {
        name: req.user.name,
        email: req.user.email,
        title: 'Digital-Store | Панель управления сайтом',
        host: req.headers.host,
        pageName: ['Главная', 'main'],
    });
}

function controlPanelItemsRoute(req, res) {
    res.render('admin/items', {
        name: req.user.name,
        email: req.user.email,
        title: 'Digital-Store | Товары',
        host: req.headers.host,
        pageName: ['Товары', 'items'],
    });
}

async function controlPanelCategoriesRoute(req, res, db) {
    const categories = await db.collection('categories').find({}).toArray();
    res.render('admin/categories', {
        name: req.user.name,
        email: req.user.email,
        title: 'Digital-Store | Категории',
        host: req.headers.host,
        pageName: ['Категории', 'categories'],
        categoriesCount: categories.length
    });
}

function controlPanelContentRoute(req, res) {
    res.render('admin/content', {
        name: req.user.name,
        email: req.user.email,
        title: 'Digital-Store | Контент',
        host: req.headers.host,
        pageName: ['Контент', 'content'],
    });
}

function controlPanelAdministratorsRoute(req, res) {
    res.render('admin/administrators', {
        name: req.user.name,
        email: req.user.email,
        title: 'Digital-Store | Администраторы',
        host: req.headers.host,
        pageName: ['Администраторы', 'administrators'],
    });
}

function controlPanelDatabaseRoute(req, res) {
    res.render('admin/database', {
        name: req.user.name,
        email: req.user.email,
        title: 'Digital-Store | Настройка Базы Данных',
        host: req.headers.host,
        pageName: ['База данных', 'database'],
    });
}

function controlPanelAddCategory(req, res, db) { 
    try {
        const data = {
            title: req.body.title.toLowerCase().trim(),
            img: req.body.img,
            type: req.body.type,
            format: req.body.format
        }
        db.collection('categories').insertOne(data);
        res.redirect('/control-panel/categories');
    } catch {
        res.render('main/404');
    }
}

function controlPanelDellCategory(req, res, db) {
    try {
        const data = JSON.parse(req.body.category);
        db.collection('categories').deleteOne({"_id": ObjectID(data.id)});
        res.redirect('/control-panel/categories');
    } catch (error) {
        console.log(error);
        res.render('main/404');
    }
}

function controlPanelUpdCategory(req, res, db) {
    try {
        const data = {
            id: req.body.id,
            title: req.body.title.toLowerCase().trim(),
            originalTitle: req.body.originalTitle.toLowerCase().trim(),
            img: req.body.img,
            type: req.body.type,
            format: req.body.format
        }
        db.collection('categories').updateOne({"_id": ObjectID(data.id)}, {$set: {title: data.title, img: data.img, type: data.type, format: data.format}});
        db.collection('items').updateMany({"category": data.originalTitle}, {$set: {category: data.title}});
        res.redirect('/control-panel/categories');
        
    } catch (error) {
        console.log(error);
        res.render('main/404');
    }
}

function controlPanelAddIcon(req, res, db) {
    try {
        res.redirect('/control-panel/categories');
    } catch (error) {
        console.log(error);
        res.render('main/404');
    }
}

function controlPanelDellIcon(req, res, db) {
    const path = `./dist/public/img/service-icons/${req.body.img}`
    try {
        fs.unlinkSync(path);
        res.redirect('/control-panel/categories');
    } catch (error) {
        console.log(error);
        res.render('main/404');
    }
}

module.exports = function (server, db) {
    server.get('/', (req, res) => indexRoute(req, res, db));
    server.get('/api', (req, res) => getItemsRoute(req, res, db));
    server.get('/how-to-buy', (req, res) => howToBuyRoute(req, res, db));
    server.get('/contacts', (req, res) => contactsRoute(req, res, db));
    server.get('/comments', (req, res) => commentsRoute(req, res, db));
    server.get('/my-orders', (req, res) => myOrdersRoute(req, res, db));
    server.get('/product/:id', (req, res) => onePageItemRoute(req, res, db));
    server.get('/control-panel', checkAuthenticated, (req, res) => controlPanelRoute(req, res));
    server.get('/control-panel/items', checkAuthenticated, (req, res) => controlPanelItemsRoute(req, res));
    server.get('/control-panel/categories', checkAuthenticated, (req, res) => controlPanelCategoriesRoute(req, res, db));
    server.get('/control-panel/content', checkAuthenticated, (req, res) => controlPanelContentRoute(req, res));
    server.get('/control-panel/administrators', checkAuthenticated, (req, res) => controlPanelAdministratorsRoute(req, res));
    server.get('/control-panel/database', checkAuthenticated, (req, res) => controlPanelDatabaseRoute(req, res));

    server.post('/control-panel/categories/create', checkAuthenticated, (req, res) => controlPanelAddCategory(req, res, db));
    server.post('/control-panel/categories/delete', checkAuthenticated, (req, res) => controlPanelDellCategory(req, res, db));
    server.post('/control-panel/categories/update', checkAuthenticated, (req, res) => controlPanelUpdCategory(req, res, db));
    server.post('/control-panel/categories/addicon', checkAuthenticated, (req, res) => controlPanelAddIcon(req, res, db));
    server.post('/control-panel/categories/dellicon', checkAuthenticated, (req, res) => controlPanelDellIcon(req, res, db));
}

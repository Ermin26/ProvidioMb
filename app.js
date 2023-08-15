if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
//const layouts = require('ejs-mate')
const fs = require('fs');
const bodyParser = require('body-parser');
const override = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser')
const User = require('./models/models');
const People = require('./models/users');
const { isLoged } = require('./midleware/check');
const { loged } = require('./midleware/checkEmployeLogin');
const users = require('./models/users');
const Week = require('./models/week');
const Costs = require('./models/costs');
const Employers = require('./models/employees');
const Vacation = require('./models/vacation');
const Notifications = require('./models/notifications');
const { findByIdAndDelete } = require('./models/models');

const db_URL = process.env.DB_URL

mongoose.connect(db_URL);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connection established");
})


app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.json());
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile)



//app.use(cookieParser()) ne rabis ce mas express-session
app.use(override('_method'))
app.use(mongoSanitize());


const secret = process.env.SECRET || 'mySecret';

const store = new MongoDBStore({
    uri: db_URL,
    databaseNamespace: 'providioMB',
    secret: secret,
    touchAfter: 24 * 60 * 60,
})

store.on('error', function (e) {
    console.log("Session error", e)
});

const sessionConf = {
    name: 'session',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expire: Date.now() + 1000 * 60 * 60 * 24 * 2,
        maxAge: 2 * 60 * 60 * 24 * 1000,
    }
}

app.use(session(sessionConf));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use('local-people', new LocalStrategy(People.authenticate()));
//! mora bit serializeUser => User obvezno
passport.serializeUser(People.serializeUser());
passport.deserializeUser(People.deserializeUser());
passport.use('local', new LocalStrategy(Employers.authenticate()));
passport.serializeUser(Employers.serializeUser());
passport.deserializeUser(Employers.deserializeUser());

let currentWeek = []
let checkWeeks = []
let currentMonth = [];
let currentYear = [];
let datum = new Date();
let day = datum.getDay();

let weekUpdate = 1;
let deleteUpdate = 0;
let todayDate = new Date();
let date = todayDate.toLocaleDateString()
let year = todayDate.getFullYear()
let month = todayDate.getMonth() + 1;


//! -------------------------
async function checkDetails() {
    let myYear = await Week.find().select('year -_id');
    for (let year of myYear) {
        currentYear.push(year.year)
    }

    let weekCurent = await Week.find();
    for (weeks of weekCurent) {
        if (!currentWeek.length) {
            currentWeek.push(weeks.week);
            checkWeeks.push(weeks.minusWeek);
        }
    }
    //?---------------------------------------
    //! Treba je naredit tudi za spremembo leta


    if (day === weekUpdate && currentWeek[0] != checkWeeks[0]) {
        let week = parseInt(currentWeek[0]) + 1;
        const newWeek = await Week.findOneAndUpdate({ week: `${week}`, minusWeek: `${week}` })
        newWeek.save()
        currentWeek.pop();
        currentWeek.push(week);
        checkWeeks.pop();
        checkWeeks.push(week);

    }

    if (deleteUpdate === day && currentWeek[0] === checkWeeks[0]) {
        let undoWeek = parseInt(checkWeeks[0]) - 1;
        const newWeek = await Week.findOneAndUpdate({ minusWeek: `${undoWeek}` })
        newWeek.save();
        checkWeeks.pop();
        checkWeeks.push(undoWeek);

    }
    if (year != currentYear[0]) {
        const newBill = 1;
        const billNew = 1;
        currentYear.pop();
        currentYear.push(year);
        currentMonth.pop();
        currentMonth.push(month);
        let updateYear = await Week.findOneAndUpdate({ year: `${year}`, week: 1, minusWeek: 1 });
        updateYear.save()
    }
}
checkDetails();
//! -------------------------

app.use((req, res, next) => {
    //console.log("----------", req.session, "----------")
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    checkDetails();
    next();
})




app.get('/users', isLoged, async (req, res) => {
    const users = await People.find({})
    const employees = await Employers.find({})
    const notifications = await Notifications.find({ status: 'false' });
    res.render('allUsers', { users, employees, notifications })
});

app.get('/employee/edit/:id', isLoged, async (req, res) => {
    const { id } = req.params
    const employee = await Employers.findById(id)
    const notifications = await Notifications.find({ status: 'false' });
    res.render('editEmployee', { employee, notifications })
})
app.put('/editEmploye/:id', isLoged, async (req, res) => {
    const { id } = req.params;
    const employee = await Employers.findByIdAndUpdate(id, { ...req.body.employers });
    await employee.save();
    req.flash('success', 'User data was successfully updated.');
    res.redirect(`/users`)
})
/*
app.delete('/employee/:id', isLoged, async (req, res) => {
    const { id } = req.params;
    const user = await Employers.findByIdAndDelete(id)
    res.redirect('/users')
})
*/
app.get('/users/edit/:id', isLoged, async (req, res) => {
    const { id } = req.params;
    const user = await People.findById(id);
    const notifications = await Notifications.find({ status: 'false' });
    //console.log(user);
    res.render('editUser', { user, notifications });
})
app.put('/users/:id', isLoged, async (req, res) => {
    const { id } = req.params;
    const user = await People.findByIdAndUpdate(id, { ...req.body.user });
    await user.save();
    req.flash('success', 'User data was successfully updated.');
    res.redirect(`/users`)
})

app.delete('/users/:id', isLoged, async (req, res) => {
    const { id } = req.params;
    const user = await People.findByIdAndDelete(id);
    req.flash('success', 'User was successfully deleted.');
    res.redirect('/users')
})

app.get('/', async (req, res) => {
    checkDetails();
    const perYear = await User.find({ "year": `${year}` }).sort({ "numPerYear": "descending" }).limit(1)
    const perMonth = await User.find({ "month": `${month}`, "year": `${year}` }).sort({ "numPerMonth": 'descending' }).limit(1)
    
    const notifications = await Notifications.find({ status: 'false' });
    if (perYear.length && perMonth.length) {
        const newBill = perYear[0].numPerYear + 1;
        const billNew = perMonth[0].numPerMonth + 1 || 1;
        if (month != currentMonth[0]) {
            const billNew = 1;
            currentMonth.pop();
            currentMonth.push(month);
            res.render('index', { date, year, month, newBill, billNew, currentWeek, notifications })
        } else {
            return res.render('index', { date, year, month, newBill, billNew, currentWeek, notifications })
        }
    } else {
        currentMonth.push(month)
        const newBill = perYear[0].numPerYear + 1;
        const billNew = 1;
        res.render('index', { date, year, month, billNew, newBill, currentWeek, notifications })
    }

})


app.get('/register', isLoged, async (req, res) => {
    const notifications = await Notifications.find({ status: 'false' });
    res.render('register', { notifications});
})

app.get('/vacation', isLoged, async (req, res) => {
    const employees = await Employers.find({employmentStatus:'zaposlen/a', status: 'active'});
    const vacation = await Vacation.find({});
    const notifications = await Notifications.find({ status: 'false' });
    let checkDate = month + '/'+ todayDate.getDate().toString() + '/' + year
    let myDate = todayDate.getDate().toString() + '/'+ month + '/' + year
    
    res.render('editVacation', { employees, vacation, notifications, checkDate, myDate });
})

app.post('/vacation/approve/:id', isLoged, async (req, res) => {
    const { id } = req.params;
    const holId = req.body.holidayId;
    const vacation = await Vacation.findById(id);
    const notifications = await Notifications.deleteOne({vac_id: `${holId}`});
    const used = vacation.usedHolidays;

    for (let i = 0; i < vacation.pendingHolidays.length; i++) {
        if (holId === vacation.pendingHolidays[i].id) {
            const newUsed = parseInt(used) + parseInt(vacation.pendingHolidays[i].days)
            const updateUsedHolidays = await Vacation.findByIdAndUpdate(id, { usedHolidays: `${newUsed}` })
            updateUsedHolidays.save();
            //await vacation.usedHolidays = vacation.pendingHolidays[i].days
            await vacation.pendingHolidays[i].status.pop()
            await vacation.pendingHolidays[i].status.push('Approved');
            await vacation.save();
            res.redirect('/vacation')
        }
    }

})


app.post('/vacation/reject/:id', isLoged, async (req, res) => {
    const { id } = req.params;
    const holId = req.body.holidayId;
    const vacation = await Vacation.findById(id);
    const notifications = await Notifications.deleteOne({vac_id: `${holId}`});
    for (let i = 0; i < vacation.pendingHolidays.length; i++) {
        if (holId === vacation.pendingHolidays[i].id) {
            await vacation.pendingHolidays[i].status.pop()
            await vacation.pendingHolidays[i].status.push('Rejected');
            await vacation.save();
            res.redirect('/vacation')
        }
    }

})


app.post('/vacation/rejectAfter/:id', isLoged, async (req, res) => {
    const { id } = req.params;
    const holId = req.body.holidayId;
    const vacation = await Vacation.findById(id);
    const used = vacation.usedHolidays;
    for (let i = 0; i < vacation.pendingHolidays.length; i++) {
        if (holId === vacation.pendingHolidays[i].id) {
            const newUsed = parseInt(used) - parseInt(vacation.pendingHolidays[i].days)
            const updateUsedHolidays = await Vacation.findByIdAndUpdate(id, { usedHolidays: `${newUsed}` })
            updateUsedHolidays.save();
            await vacation.pendingHolidays[i].status.pop()
            await vacation.pendingHolidays[i].status.push('Rejected');
            await vacation.save();
            res.redirect('/vacation')
        }
    }

})


app.post('/holidays', async (req, res) => {
    const data = req.body;
    const ifExistsUser = await Vacation.find({ user: `${data.user}` });
    if (ifExistsUser.length) {
        for (user of ifExistsUser) {
            const userEdit = await Vacation.findByIdAndUpdate(user.id, { lastYearHolidays: `${data.lastYearHolidays}`, holidays: `${data.holidays}`, overtime: `${data.overtime}` })
            userEdit.save()

        }
        req.flash('success', `Data for user ${data.user} successfully updated`);
        res.redirect('vacation')
    } else {
        const userData = await new Vacation({ user: `${data.user}`, lastYearHolidays: `${data.lastYearHolidays}`, holidays: `${data.holidays}`, overtime: `${data.overtime}` })
        userData.save();
        req.flash('success', `Successfully added data for ${data.user}`)
        res.redirect('vacation')
    }
})

app.post('/register', isLoged, async (req, res) => {
    const { username, password, role } = req.body;
    const checkUser = await People.find({ username: `${username}` })
    if (!checkUser.length) {
        const user = await new People({ username: username, role: role });
        const addedUser = await People.register(user, password);
        req.flash('success', `Successfully registered ${username} as ${role}.`);
        res.redirect('/users')
    } else {
        req.flash('error', "User `${username}` is already registered.")
        res.redirect('/register')
    }
})

app.get('/add', isLoged, async (req, res) => {
    const notifications = await Notifications.find({ status: 'false' });
    res.render('add', { notifications })
})
app.post('/addEmploye', isLoged, async (req, res) => {
    const { username, lastname, password, emplStatus, status } = req.body;
    const checkUser = await Employers.find({ username: `${username}` });
    if (!checkUser.length) {
        const user = await new Employers({ username: username, lastname: lastname, employmentStatus: emplStatus, status: status });
        const addedUser = await Employers.register(user, password);
        req.flash('success', 'Successfully added new employee')
        res.redirect('/users')
    } else {
        req.flash('error', "User with that name already registered. Please try again with diferrent username.");
        res.redirect('/add')
    }
})

app.get('/login', (req, res) => {
    res.render('login');
})
let usersData = [];
let searched = [];
//! Naredi object keys: Product name & Product length!!!
let buyedProducts = [];

app.get('/search', isLoged, async (req, res) => {
    const notifications = await Notifications.find({ status: 'false' });
    res.render('search', { usersData, searched, buyedProducts, notifications });
});
//? DELA

app.post('/search', isLoged, async (req, res, next) => {
    usersData.pop();
    searched.pop();
    buyedProducts.pop()
    const user = req.body.username;
    const data = await User.find({ buyer: { $regex: `${user}`, $options: 'i' } })
    const productName = await User.find({ buyer: { $regex: `${user}`, $options: 'i' }, 'products.name': `${req.body.product}` })

    if (!data.length) {
        req.flash('error', 'Sorry, employee not found.');
        res.redirect('/search');
    } else {
        usersData.pop();
        usersData.push(data);
        if (productName.length) {
            if (req.body.username && req.body.product) {
                let buyed = { productName: `${req.body.product}`, productsBuyed: `${productName.length}` }
                buyedProducts.push(buyed)
            }
        } else {
            //! Don't work
            req.flash('error', "Can't find product")
        }
        for (people of data) {
            searched.pop()
            searched.push(people.buyer);
        }
        res.redirect('/search');
    }
});


//isLoged,
app.get('/costs', isLoged, async (req, res) => {
    let payed = [];
    const allCosts = await Costs.find({})
    const payData = await User.find({ pay: 'true' })
    const notifications = await Notifications.find({ status: 'false' });
    for (info of payData) {
        for (productPrice of info.products) {
            for (price of productPrice.total) {
                payed.push(price)
            }
        }
    }
    if (!allCosts.length) {
        res.render('costs', { allCosts, notifications })
    } else {
        res.render('costs', { allCosts, payData, payed, notifications })
    }

})

app.post('/addCosts', isLoged, async (req, res) => {
    let datum = new Date();
    let date = datum.toLocaleDateString()
    const bill = req.body;

    const newBill = await new Costs({ date: `${bill.date}`, buyedProducts: `${bill.buyedProducts}`, totalPrice: `${bill.totalPrice}`, bookedDate: `${date}`, bookedUser: req.session.passport.user })
    await newBill.save()
    res.redirect('costs')
})

app.delete('/costs/:id', isLoged, async (req, res) => {
    const { id } = req.params;
    const deleteMe = await Costs.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted.');
    res.redirect('/costs')
})



app.post('/login', passport.authenticate('local-people', { failureFlash: true, failureRedirect: '/login', keepSessionInfo: true }), async (req, res) => {
    const redirect = req.session.returnTo || '/';
    req.flash('success', 'Successfully loged', req.user.username, '.', 'Your Role is:', req.user.role)
    delete req.session.returnTo;
    res.redirect(redirect)
})

//? DELA
/*
app.get('/delete', async (req, res) => {
    const all = await User.deleteMany({ 'month': 8 })
    //const allProducts = await User.products.deleteMany({'name': 'Zono'})
    res.redirect('/')
})
*/
//? DELA

app.post('/sell', isLoged, async (req, res) => {

    const data = (req.body);
    if (Array.isArray(data.product)) {

        const selledProduct = await new User({ izdal: `${data.izdal}`, buyer: `${data.buyer}`, soldDate: `${data.soldDate}`, year: `${data.year}`, month: `${data.month}`, numPerYear: `${data.numPerYear}`, numPerMonth: `${data.numPerMonth}`, pay: `${data.pay}` })

        for (let i = 0; i < data.product.length; i++) {
            //console.log(data.product)

            selledProduct.products[i] = ({
                name: `${data.product[i]}`, qty: `${data.qty[i]}`, price: `${data.price[i]}`, firstOfWeek: `${data.firstOfWeek[i]}`, total: `${data.total[i]}`
            });

            if (i === data.product.length - 1) {
                await selledProduct.save();
                req.flash('success', 'Successful added to the base')
                return res.redirect('/')
            }

        }

    } else {
        const selledProduct = await new User({ izdal: `${data.izdal}`, buyer: `${data.buyer}`, kt: `${data.kt}`, soldDate: `${data.soldDate}`, payDate: `${data.payDate}`, year: `${data.year}`, month: `${data.month}`, numPerYear: `${data.numPerYear}`, numPerMonth: `${data.numPerMonth}`, pay: `${data.pay}` })
        selledProduct.products = ({
            name: `${data.product}`, qty: `${data.qty}`, price: `${data.price}`, firstOfWeek: `${data.firstOfWeek}`, total: `${data.total}`
        });
        await selledProduct.save();
        req.flash('success', 'Successful added to the base')
        return res.redirect('/')
    }


})

//? DELA
// Separate products ---> //? DONE!
app.get('/all', isLoged, async (req, res) => {

    let datum = new Date();
    let month = datum.getMonth() + 1;
    //const userData = await User.find({}).sort({ "year": "descending" });
    const userData = await User.find({}).sort({ "year": -1, "numPerYear": -1 });
    const yearNum = await User.find({}).sort({ "numPerYear": "descending" }).limit(1)
    const payData = await User.find({ pay: 'true' }).sort({ "year": -1, "numPerMonth": -1 });
    const notPayData = await User.find({ pay: 'false' }).sort({ "year": -1, "numPerMonth": -1 });
    const thisMonth = await User.find({ "month": `${month}`, "year": `${year}` }).sort({ "numPerMonth": 'descending' })
    const notifications = await Notifications.find({ status: 'false' });
    let payedLength = payData.length;
    let notPayedLength = notPayData.length;
    return res.render('selled', { userData, payData, notPayData, yearNum, payedLength, notPayedLength, thisMonth, notifications })
});

//? DELA

app.get('/all/:id', isLoged, async (req, res) => {
    const userData = await User.findById(req.params.id);
    const notifications = await Notifications.find({ status: 'false' });
    if (!userData) {
        req.flash('error', 'User not found');
        return res.redirect('/all');
    }
    res.render('user', { userData, notifications })
});
//? DELA
app.get('/all/:id/edit', isLoged, async (req, res) => {
    const { id } = req.params
    const user = await User.findById(id);
    const notifications = await Notifications.find({ status: 'false' });

    if (!user) {
        return res.redirect('/all')
    }
    else {
        for (let product of user.products) {
            return res.render('edit', { user, product, notifications })
        }
    }
});
app.put('/all/:id/products', isLoged, async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const user = await User.findById(id);
    if (Array.isArray(data.productId)) {
        for (let j = 0; j < data.productId.length; j++) {
            for (let i = 0; i < user.products.length; i++) {
                if (data.productId[j] === user.products[i].id) {
                   await user.products[i].name.pop()
                    await user.products[i].qty.pop()
                    await user.products[i].price.pop()
                    await user.products[i].total.pop()
                    await user.products[i].name.push(data.productName[j]);
                    await user.products[i].qty.push(data.productQty[j]);
                    await user.products[i].price.push(data.productPrice[j]);
                    await user.products[i].total.push(data.productTotal[j]);
                    await user.save();
    
                }
            }
            }
    }
    else {
        await user.products[0].name.pop()
        await user.products[0].qty.pop()
        await user.products[0].price.pop()
        await user.products[0].total.pop()
        await user.products[0].name.push(data.productName);
        await user.products[0].qty.push(data.productQty);
        await user.products[0].price.push(data.productPrice);
        await user.products[0].total.push(data.productTotal);
        await user.save();
    
    }
    req.flash('success', 'Product data was successfully updated.');
    res.redirect(`/all/${user._id}`);
})
//? DELA

app.put('/all/:id', isLoged, async (req, res) => {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { ...req.body.user });
    await user.save();
    req.flash('success', 'User data was successfully updated.');
    res.redirect(`/all/${user._id}`)
})

//? DELA

app.delete('/all/:id', isLoged, async (req, res) => {
    const { id } = req.params
    const user = await User.findByIdAndDelete(id);
    req.flash('success', 'User successfully deleted.');
    res.redirect('/all')
});




app.get('/logout', isLoged, (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        } else {
            req.flash('success', 'Logged out. Now you cannot make any changes.');
            res.redirect('/');
        }
    });
});

app.get('*', async (req, res) => {
    res.render('error404')
})

const port = process.env.PORT || 5000
app.listen(port, checkDetails(),
    console.log(`listening on ${port}`))

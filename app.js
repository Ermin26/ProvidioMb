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
    res.render('allUsers', { users, employees })
});

app.get('/employee/edit/:id', isLoged, async (req, res) => {
    const { id } = req.params
    const employee = await Employers.findById(id)
    res.render('editEmployee', { employee })
})
app.put('/editEmploye/:id', isLoged, async (req, res) => {
    const { id } = req.params;
    const employee = await Employers.findByIdAndUpdate(id, { ...req.body.employers });
    await employee.save();
    req.flash('success', 'User data was successfully updated.');
    res.redirect(`/users`)
})

app.delete('/employee/:id', isLoged, async (req, res) => {
    const { id } = req.params;
    const user = await Employers.findByIdAndDelete(id)
    res.redirect('/users')
})
app.get('/users/edit/:id', isLoged, async (req, res) => {
    const { id } = req.params;
    const user = await People.findById(id);
    //console.log(user);
    res.render('editUser', { user });
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

    const perYear = await User.find({ "year": `${year}` }).sort({ "numPerYear": "descending" }).limit(1)
    const perMonth = await User.find({ "month": `${month}` }).sort({ "numPerMonth": 'descending' }).limit(1)

    if (perYear.length && perMonth.length) {

        const newBill = perYear[0].numPerYear + 1 || 1;
        const billNew = perMonth[0].numPerMonth + 1 || 1;
        if (month != currentMonth[0]) {
            const billNew = 1;
            currentMonth.pop();
            currentMonth.push(month);
            res.render('index', { date, year, month, newBill, billNew, currentWeek })
        } else {
            return res.render('index', { date, year, month, newBill, billNew, currentWeek })
        }
    } else {
        currentMonth.push(month)
        const newBill = 1;
        const billNew = 1;
        res.render('index', { date, year, month, billNew, newBill, currentWeek })
    }

})


app.get('/register', isLoged, async (req, res) => {
    res.render('register');
})

app.get('/vacation', isLoged, async (req, res) => {
    const employees = await Employers.find({});
    res.render('editVacation', { employees });
})

app.post('/holidays', async (req, res) => {
    const data = req.body;
    const userData = await new Vacation({ user: `${data.user}`, lastYearHolidays: `${data.lastYearHolidays}`, holidays: `${data.holidays}` })
    userData.save();
    req.flash('success', `Successfully updated data for ${data.user}`)
    res.redirect('vacation')
})

app.post('/register', isLoged, async (req, res) => {
    const { username, password, role } = req.body;
    const user = await new People({ username: username, role: role });
    const addedUser = await People.register(user, password);
    console.log(addedUser, 'sucesfully registered');
})

app.get('/add', isLoged, async (req, res) => {
    res.render('add')
})


app.post('/addEmploye', isLoged, async (req, res) => {
    const { username, lastname, password, emplStatus, status } = req.body;
    const user = await new Employers({ username: username, lastname: lastname, employmentStatus: emplStatus, status: status });
    const addedUser = await Employers.register(user, password);
    req.flash('success', 'Successfully added new employee')
    res.redirect('/users')
})

let employeeData = []
let userID = []
app.get('/myData', async (req, res) => {
    let findedUser = []
    let employee = employeeData[0]
    const user = await User.find({ buyer: { $regex: `${employee}`, $options: 'i' } }).limit(1)
    /*
        if (user) {
            let newUser = employeeData[0];
            const findedEmployee = await User.find({ buyer: { $regex: `${employee}`, $options: 'i' }, pay: 'false' })
            res.render('userCheckByHimself', { findedEmployee, user })
        }
    */

    for (let username of user) {
        findedUser.pop();
        findedUser.push(username.buyer)
    }
    let newUser = findedUser[0];
    if (!employee) {
        res.redirect('/employee')
    } else {
        const findedEmployee = await User.find({ buyer: { $regex: `${employee}`, $options: 'i' }, pay: 'false' })
        const holidayInfo = await Vacation.find({ user: { $regex: `${employee}`, $options: 'i' } })
        const holiday = await Vacation.find({})

        //console.log(holidayInfo)
        for (pending of holidayInfo) {
            userID.pop();
            userID.push(pending.id)
            //console.log(pending.id)
        }
        res.render('userCheckByHimself', { findedEmployee, newUser, holidayInfo, year, holiday })
    }

})

app.get('/askForHolidays', async (req, res) => {
    //console.log(employeeData)
    res.render('askForHolidays', { employeeData, userID })
})

app.post('/askForHoliday', async (req, res) => {
    const data = req.body;
    let startDate = data.startDate;
    const dateStart = startDate.split('-').reverse().join('.');
    const dateEnd = data.endDate.split('-').reverse().join('.');
    const user = await Vacation.findById(`${data.userid}`)
    user.pendingHolidays.push({ startDate: `${dateStart}`, endDate: `${dateEnd}`, days: `${data.days}`, status: `${data.status}` });
    await user.save();
    console.log(user)
    //const holiday = await Vacation.findByIdAndUpdate({ pendingHolidays: [{ startDate: `${dateStart}`, endDate: `${dateEnd}`, days: `${data.days}`, status: `${data.status}` }] })
    //await holiday.save();
    //console.log(data);
    res.redirect('askForHolidays')
})

app.get('/employee', async (req, res) => {
    res.render('employeeLogin');
})

app.post('/employee/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/employee', keepSessionInfo: true }), async (req, res) => {
    req.flash('success', 'Successfully loged', req.user.username)
    let user = req.session.passport.user;
    employeeData.pop();
    employeeData.push(user)
    res.redirect('/myData');
})
app.get('/logMeOut', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        } else {
            employeeData.pop();
            userID.pop();
            req.flash('success', 'Logged out.');
            res.redirect('/employee');
        }
    });
});


app.get('/login', (req, res) => {
    res.render('login');
})
let usersData = []
let searched = []

app.get('/search', isLoged, async (req, res) => {
    res.render('search', { usersData, searched });
});

//isLoged,
app.get('/costs', isLoged, async (req, res) => {
    let payed = [];
    const allCosts = await Costs.find({})
    const payData = await User.find({ pay: 'true' })
    for (info of payData) {
        for (productPrice of info.products) {
            for (price of productPrice.total) {
                payed.push(price)
            }
        }
    }
    if (!allCosts.length) {
        res.render('costs', { allCosts })
    } else {
        res.render('costs', { allCosts, payData, payed })
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

//? DELA

app.post('/search', isLoged, async (req, res, next) => {
    usersData.pop();
    searched.pop();
    const user = req.body.username;
    const data = await User.find({ buyer: { $regex: `${user}`, $options: 'i' } })
    if (!data.length) {
        req.flash('error', 'Sorry, employee not found.');
        res.redirect('/search');
    } else {
        usersData.pop();
        usersData.push(data);
        for (people of data) {
            searched.pop()
            searched.push(people.buyer);
        }
        res.redirect('/search');
    }
});


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
    const userData = await User.find({}).sort({ "year": -1, "numPerMonth": -1 });
    const yearNum = await User.find({}).sort({ "numPerYear": "descending" }).limit(1)
    const payData = await User.find({ pay: 'true' }).sort({ "year": -1, "numPerMonth": -1 });
    const notPayData = await User.find({ pay: 'false' }).sort({ "year": -1, "numPerMonth": -1 });
    const thisMonth = await User.find({ "month": `${month}` }).sort({ "numPerMonth": 'descending' })
    let payedLength = payData.length;
    let notPayedLength = notPayData.length;
    return res.render('selled', { userData, payData, notPayData, yearNum, payedLength, notPayedLength, thisMonth })
});

//? DELA

app.get('/all/:id', isLoged, async (req, res) => {
    const userData = await User.findById(req.params.id);
    if (!userData) {
        req.flash('error', 'User not found');
        return res.redirect('/all');
    }
    res.render('user', { userData })
});
//? DELA
app.get('/all/:id/edit', isLoged, async (req, res) => {
    const { id } = req.params
    const user = await User.findById(id);
    if (!user) {
        return res.redirect('/all')
    }
    else {
        return res.render('edit', { user })

    }

});

//? DELA

app.put('/all/:id', isLoged, async (req, res) => {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { ...req.body.user });
    await user.save();
    req.flash('success', 'User data was successfully updated.');
    res.redirect(`/ all / ${user._id}`)
})

//? DELA

app.delete('/all/:id', isLoged, async (req, res) => {
    const { id } = req.params
    const user = await User.findByIdAndDelete(id);
    req.flash('success', 'User successfully deleted.');
    res.redirect('/all')
});


/*
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no, Something Went wrong!'
    res.status(statusCode).render('error', { err });
})
*/

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

const port = process.env.PORT || 5000
app.listen(port,
    console.log(`listening on ${port}`))
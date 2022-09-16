if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
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
const {isLoged} = require('./midleware/check');

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
        expire: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}

app.use(session(sessionConf));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(People.authenticate()));
//! mora bit serializeUser => User obvezno
passport.serializeUser(People.serializeUser());
passport.deserializeUser(People.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


let currentWeek = [37];
let weeks = [37]
let currentMonth = [];
let currentYear = [2022];

let datum = new Date();
let day = datum.getDay();

let weekUpdate = 1;
let deleteUpdate = 0;




app.get('/', async (req, res) => {
//?---------------------------------------
    //! Treba je naredit tudi za spremembo leta

    if (day === weekUpdate && currentWeek[0] != weeks[0]) {
        let week = parseInt(currentWeek[0]) + 1;
        currentWeek.pop();
        currentWeek.push(week);
        weeks.pop();
        weeks.push(week);


    }

    if (deleteUpdate === day && currentWeek[0] === weeks[0]) {
        let undoWeek = parseInt(weeks[0]) - 1;
        weeks.pop();
        weeks.push(undoWeek);

    }

    let todayDate = new Date();
    let date = todayDate.toLocaleDateString()
    let year = todayDate.getFullYear()
    let month = todayDate.getMonth() + 1;


    const perYear = await User.find({ "year": `${year}` }).sort({ "numPerYear": "descending" }).limit(1)
    const perMonth = await User.find({ "month": `${month}` }).sort({ "numPerMonth": 'descending' }).limit(1)
    if (perYear.length && perMonth.length) {
        const newBill = perYear[0].numPerYear + 1
        const billNew = perMonth[0].numPerMonth + 1

        if (month != currentMonth[0]) {
            const billNew = 1;
            currentMonth.pop();
            currentMonth.push(month);

            if (year != currentYear[0]) {
                const newBill = 1;
                currentYear.pop();
                currentYear.push(year);
                res.render('index', { date, year, month, newBill, billNew, currentWeek })
            }
            res.render('index', { date, year, month, newBill, billNew, currentWeek })
        }

        else {
            return res.render('index', { date, year, month, newBill, billNew, currentWeek })
        }
    }
    else {
        currentMonth.push(month)
        const billNew = 1;
        const newBill = 1;
        res.render('index', { date, year, month, billNew, newBill, currentWeek })
    }

})

app.get('/register', async (req, res) => {
    res.render('register');
})

/*
app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    const user = await new People({username: username, role: role});
   const addedUser =  await People.register(user, password);
    console.log(addedUser, 'sucesfully registered');
})


app.get('/users', async (req, res) => {
    const data = await People.deleteMany({});
    //const data = await People.find({});
    
    res.send(data);
})
*/
app.get('/login', (req, res) => {
    res.render('login');
})

app.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect:'/login'}), async (req, res) => {
    console.log(req.body, "welcome back")
    const redirectUrl = req.session.returnTo || '/all'
    delete req.session.returnTo;
    res.redirect(redirectUrl)
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

app.post('/sell',isLoged, async (req, res) => {
   
    const data = (req.body);
    if (Array.isArray(data.product)) {

        const selledProduct = await new User({ izdal: `${data.izdal}`, buyer: `${data.buyer}`, soldDate: `${data.soldDate}`, year: `${data.year}`, month: `${data.month}`, numPerYear: `${data.numPerYear}`, numPerMonth: `${data.numPerMonth}`, pay: `${data.pay}` })

        for (let i = 0; i < data.product.length; i++) {
            //console.log(data.product)

            selledProduct.products[i] = ({
                name: `${data.product[i]}`, qty: `${data.qty[i]}`, price: `${data.price[i]}`, firstOfWeek: `${data.firstOfWeek[i]}`, total: `${data.total[i]}`
            });

            if (i === data.product.length - 1) {
                console.log(selledProduct, ' i am selledProduct')
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

    //! TODO this !data.firstOfWeek => ce bo en izdelek free 1 pa za placat
    //! bo vrglo ERROR!! POPRAVI!!!!


})

//? DELA
// Separate products ---> //? DONE!
app.get('/all',isLoged, async (req, res) => {
    const userData = await User.find({});
    const yearNum = await User.find({}).sort({ "numPerYear": "descending" }).limit(1)
    const payData = await User.find({ pay: 'true' })
    let payedLength = payData.length;
    const notPayData = await User.find({ pay: 'false' })
    let notPayedLength = notPayData.length;
   return res.render('selled', { userData, payData, notPayData, yearNum, payedLength, notPayedLength })
});

//? DELA

app.get('/all/:id',isLoged, async (req, res) => {
    const userData = await User.findById(req.params.id);
    if (!userData) {
        return res.redirect('/all');
    }
    res.render('user', { userData })
});
//? DELA
app.get('/all/:id/edit', async (req, res) => {
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

app.put('/all/:id', async (req, res) => {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { ...req.body.user });
    console.log(user)
    await user.save();
    res.redirect(`/all/${user._id}`)
})

//? DELA

app.delete('/all/:id', async (req, res) => {
    const { id } = req.params
    const user = await User.findByIdAndDelete(id);
    res.redirect('/all')
});


/*
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no, Something Went wrong!'
    res.status(statusCode).render('error', { err });
})
*/

app.get('/logout',isLoged, (req, res, next) => {
    req.logout(function (err) {
        if (err) {
             return next(err);
            }else{
    console.log('logged out');
    res.redirect('/');
            }
    });
});

const port = process.env.PORT || 3000
app.listen(port,
    console.log(`listening on ${port}`))
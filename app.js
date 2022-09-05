if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const override = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoSanitize = require('express-mongo-sanitize');
const User = require('./models/models');
const People = require('./models/users');

const db_URL = process.env.DB_URL

mongoose.connect(db_URL)

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

app.use(override('_method'))
app.use(mongoSanitize());

/*
const secret = process.env.SECRET || 'mySecret';

const store = new MongoDBStore({
    url: db_URL,
    secret: secret,
    touchAfter: 24 * 60 * 60,
})

store.on('error', function (e) {
    console.log("Session error", e)
});

const sessionConf = {
    store,
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
*/
//app.use(session(sessionConf));
app.use(flash());



let currentWeek = [35];
let weeks = [35]
let currentMonth = [];
let currentYear = [2022];

let datum = new Date();
const day = datum.getDay();

let weekUpdate = 1;
let deleteUpdate = 0;

//! Treba je naredit tudi za spremembo leta

if (day === weekUpdate && currentWeek != weeks) {
    let week = parseInt(currentWeek[0]) + 1;
    currentWeek.pop();
    currentWeek.push(week);
}
if (deleteUpdate === 0) {
    let undoWeek = parseInt(weeks[0]) - 1;
    weeks.pop();
    weeks.push(undoWeek);
}

app.get('/', async (req, res) => {
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


app.get('/login', (req, res) => {
    res.render('login');
})

//? DELA

app.get('/delete', async (req, res) => {
    const all = await User.deleteMany({ 'month': 8 })
    //const allProducts = await User.products.deleteMany({'name': 'Zono'})
    res.redirect('/')
})


//? DELA

app.post('/sell', async (req, res) => {
    const data = (req.body);
    console.log(data)
    if (Array.isArray(data.product)) {
        console.log('multiple products');

        const selledProduct = await new User({ izdal: `${data.izdal}`, buyer: `${data.buyer}`, soldDate: `${data.soldDate}`, year: `${data.year}`, month: `${data.month}`, numPerYear: `${data.numPerYear}`, numPerMonth: `${data.numPerMonth}`, pay: `${data.pay}` })

        for (let i = 0; i < data.product.length; i++) {
            //console.log(data.product)

            selledProduct.products[i] = ({
                name: `${data.product[i]}`, qty: `${data.qty[i]}`, price: `${data.price[i]}`, firstOfWeek: `${data.firstOfWeek[i]}`, total: `${data.total[i]}`
            });

            if (i === data.product.length - 1) {
                console.log(selledProduct, ' i am selledProduct')
                await selledProduct.save();
                return res.redirect('/')
            }

        }

    } else {
        console.log('1 saved')

        const selledProduct = await new User({ izdal: `${data.izdal}`, buyer: `${data.buyer}`, kt: `${data.kt}`, soldDate: `${data.soldDate}`, payDate: `${data.payDate}`, year: `${data.year}`, month: `${data.month}`, numPerYear: `${data.numPerYear}`, numPerMonth: `${data.numPerMonth}`, pay: `${data.pay}` })
        selledProduct.products = ({
            name: `${data.product}`, qty: `${data.qty}`, price: `${data.price}`, firstOfWeek: `${data.firstOfWeek}`, total: `${data.total}`
        });
        await selledProduct.save();
        return res.redirect('/')
    }

    //! TODO this !data.firstOfWeek => ce bo en izdelek free 1 pa za placat
    //! bo vrglo ERROR!! POPRAVI!!!!


})

//? DELA
// Separate products ---> //? DONE!
app.get('/all', async (req, res) => {
    const userData = await User.find({});
    const yearNum = await User.find({}).sort({ "numPerYear": "descending" }).limit(1)
    const payData = await User.find({ pay: 'true' })
    let payedLength = payData.length;
    const notPayData = await User.find({ pay: 'false' })
    let notPayedLength = notPayData.length;
    return res.render('selled', { userData, payData, notPayData, yearNum, payedLength, notPayedLength })
});

//? DELA

app.get('/all/:id', async (req, res) => {
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
    res.render('edit', { user })
});

//? DELA

app.put('/all/:id', async (req, res) => {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { ...req.body.user });
    user.products = req.body

    await user.save();
    console.log(user)
    res.redirect(`/all/${user._id}`)
})

//? DELA

app.delete('/all/:id', async (req, res) => {
    const { id } = req.params
    const user = await User.findByIdAndDelete(id);
    res.redirect('/all')
});



app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no, Something Went wrong!'
    res.status(statusCode).render('error', { err });
})


const port = process.env.PORT || 3000
app.listen(port,
    console.log(`listening on ${port}`))
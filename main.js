//imports
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(session({
    secret: 'my secret key',
    saveUninitialized: true,
    resave: false
}));
app.use((req,res,next)=>{
    res.locals.message = req.session.mesage;
    delete req.session.message;
    next();
})

app.set('view engine', 'ejs');

app.use(express.static('uploads'))

app.use("", require('./routes/routes'))

try{
    mongoose.connect(process.env.MONGO_URL);
    console.log("mongoose conectado");
}catch (erro){
    console.error(erro);
}

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});
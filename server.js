const express = require('express')
const app = express()

// handlebars
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars')

app.engine('handlebars', exphbs.engine({ defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Choose a port to listen on
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.render('home', { test: 'Hello World' });
})

// Tell the app what port to listen on
app.listen(port, () => {
    console.log(`App listening on port ${port}!`);
})
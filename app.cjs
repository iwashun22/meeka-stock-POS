const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(morgan('dev'));

app.set('view engine', 'pug');

app.use('/', require('./routes/index.cjs'));
app.use('/login', require('./routes/login.cjs'));
app.use('/product', require('./routes/product.cjs'));

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

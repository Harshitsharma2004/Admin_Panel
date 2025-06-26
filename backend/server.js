require('dotenv').config();
const cors = require('cors')
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const subCategoryRoutes = require('./routes/subCategoryRoutes')
const serviceRoutes = require('./routes/serviceRoutes')
const stats = require('./routes/stats')
const attribute = require('./routes/attribute')
const provider = require('./routes/providerRoutes')
const role = require('./routes/roleRoutes')
const subAdmin = require('./routes/subAdmin')


const methodOverride = require("method-override");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use('/uploads', express.static('uploads'));
app.use(methodOverride("_method"));

app.use(cors());  // enable CORS for all routes by default

mongoose.connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => console.error('MongoDB error:', err));

app.use('/', authRoutes);
app.use('/', categoryRoutes);
app.use('/subcategory', subCategoryRoutes);
app.use('/service', serviceRoutes);
app.use('/stats',stats)
app.use('/attribute',attribute)
app.use('/provider',provider)
app.use('/roles',role)
app.use('/subAdmin',subAdmin)







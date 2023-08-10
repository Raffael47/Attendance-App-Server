const express = require('express');
const cors = require('cors');
const db = require('./models');
require('dotenv').config();

const PORT = 8000;
const app = express();
app.use(cors());

app.use(express.json());
app.use(express.static('./public'))

const { authRouter, userRouter, attendanceRouter, payrollRouter } = require('./router')

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/attendances', attendanceRouter);
app.use('/api/payrolls', payrollRouter)

app.listen(PORT, () => {
    // db.sequelize.sync({ alter: true });
    console.log(`APP RUNNING at ${PORT} ✅`)
})
const db = require('../models');
const payroll = db.Payroll;
const user = db.User;
const shift = db.Shift;
const { Op, Sequelize } = require('sequelize')

module.exports = {
    getUserPayroll: async(req, res) => {
        try {
            const startDate = req.query.startDate || '0';
            const endDate = req.query.endDate || '2099';
            const sort = req.query.sort || "ASC";
            const orderBy = req.query.orderBy || "id";
            const limit = +req.query.limit || 10;
            const page = +req.query.page || 1;

            const filter = {
                where: {
                    [Op.and]: [
                        { UserId: req.user.id },
                        { status: { [Op.or]: [ 'PAID', 'PENDING' ] } },
                        {
                            updatedAt: {
                                [Op.between]: [
                                    new Date (startDate),
                                    new Date (endDate)
                                ]
                            }
                        }
                    ]
                },
                include: [
                    {
                        model: user,
                        attributes: [ 'salary' ]
                    }
                ],
                order: [ [ Sequelize.col(orderBy), `${sort}` ] ],
                limit,
                offset: ( page - 1 ) * limit
            }

            const result = await payroll.findAll( filter );
            const total = await payroll.count( filter );

            if (!result) throw { status: false, message: 'Data not found' }

            res.status(200).send({
                status: true,
                limit,
                totalPage: Math.ceil(total / limit),
                currentPage: page,
                result
            });
        } catch (err) {
            res.status(404).send(err);
        }
    },
    getAllPayroll: async(req, res) => {
        try {
            const startDate = req.query.startDate || '0';
            const endDate = req.query.endDate || '2099';
            const sort = req.query.sort || "ASC";
            const orderBy = req.query.orderBy || "id";
            const limit = +req.query.limit || 10;
            const page = +req.query.page || 1;

            const filter = {
                where: {
                    date: {
                        [Op.between]: [
                            new Date (startDate),
                            new Date (endDate)
                        ]
                    }
                },
                include: [
                    {
                        model: user,
                        attributes: [ 'name', 'email', 'salary', 'imgProfile' ]
                    }
                ],
                order: [ [ Sequelize.col(orderBy), `${sort}` ] ],
                limit,
                offset: ( page - 1 ) * limit
            }

            const result = await payroll.findAll( filter );
            const total = await payroll.count( filter );

            if (!result) throw { status: false, message: 'Data not found' }

            res.status(200).send({
                status: true,
                limit,
                totalPage: Math.ceil(total / limit),
                currentPage: page,
                result
            });
        } catch (err) {
            res.status(404).send(err)
        }
    },
    createPayroll: async(req, res) => {
        try {
            if (req.user.isAdmin) throw { status: false, message: 'Admin cannot create payroll' }
            const userInfo = await user.findOne({ where: { id: req.user.id } })
            const tax = userInfo.salary * 15 / 100;
            const deduction = 0;
            const net = userInfo.salary - tax - deduction
            const monthly = new Date( Date.now() );
            const offsetTime = 7 * 60 * 60 * 1000
            const date = new Date( new Date(monthly.getFullYear(), (monthly.getMonth())).getTime() + offsetTime )

            const payrollCheck = await payroll.findOne({
                where: { date, UserId: req.user.id }
            })

            if (!payrollCheck) {
                await payroll.create({ tax, deduction, net, date, UserId: req.user.id, status: 'UNPAID' })
                res.status(201).send({
                    status: true,
                    message: 'New monthly payroll created'
                });
            }
            else res.status(200).send({ status: true, message: 'Payroll available' });
        } catch (err) {
            res.status(400).send(err);
        }
    },
    lateDeduction: async(req, res) => {
        try {
            const userInfo = await user.findOne({ where: { id: req.user.id }, include: [{ model: shift }] })
            const currentDeduction = await payroll.findOne({
                where: {
                    [Op.and]: [ { UserId: req.user.id }, { status: 'UNPAID' } ]
                }
            })
            const tax = userInfo.salary * 15 / 100;
            const salaryPerMinute = userInfo.salary / 21 / 24 / 60 ;

            const day = new Date(Date.now()).getDate()
            const month = new Date(Date.now()).getMonth()
            const year = new Date(Date.now()).getFullYear()
            const startHour = userInfo.Shift.shiftStart.split(':')[0]

            let offset = 7 * 60 * 60 * 1000
            const today = new Date (year, month, day, startHour).getTime() + offset
            const currentTime = new Date(Date.now()).getTime() + offset
            const minutesLate = Math.floor( (today - currentTime) / 1000 / 60 )
            
            let deduction = currentDeduction.deduction + (salaryPerMinute * minutesLate);
            const net = userInfo.salary - tax - deduction;
            await payroll.update({ deduction, net }, {
                where: {
                    UserId: req.user.id, status: 'UNPAID'
                }
            });

            res.status(200).send({
                status: true,
                message: 'Net Salary Deducted'
            });
        } catch (err) {
            console.log(err)
            res.status(400).send("haah")
        }
    },
    noClockIn: async(req, res) => {
        try {
            const userInfo = await user.findOne({ where: { id: req.user.id } })
            const currentDeduction = await payroll.findOne({
                where: {
                    [Op.and]: [ { UserId: req.user.id }, { status: 'UNPAID' } ]
                }
            })
            const tax = userInfo.salary * 15 / 100;
            const salaryPerDay = userInfo.salary / 21;
            let deduction = currentDeduction.deduction + salaryPerDay;
            const net = userInfo.salary - tax - deduction;
            await payroll.update({ deduction, net }, {
                where: {
                    [Op.and]: [ { UserId: req.user.id }, { status: 'UNPAID' } ]
                }
            });
            await transaction.commit();

            res.status(200).send({
                status: true,
                message: 'Net Salary Deducted'
            });
        } catch (err) {
            res.status(400).send(err)
        }
    },
    noClockOut: async(req, res) => {
        try {
            const userInfo = await user.findOne({ where: { id: req.user.id } })
            const currentDeduction = await payroll.findOne({
                where: {
                    [Op.and]: [ { UserId: req.user.id }, { status: 'UNPAID' } ]
                }
            })
            const tax = userInfo.salary * 15 / 100;
            const salaryPerDay = userInfo.salary / 21;
            let deduction = currentDeduction.deduction + (salaryPerDay / 2);
            const net = userInfo.salary - tax - deduction;
            await payroll.update({ deduction, net }, {
                where: {
                    [Op.and]: [ { UserId: req.user.id }, { status: 'UNPAID' } ]
                }
            });

            res.status(200).send({
                status: true,
                message: 'Net Salary Deducted'
            });
        } catch (err) {
            res.status(400).send(err)
        }
    },
    settlePayment: async(req, res) => {
        try {
            const { id } = req.body;
            await payroll.update({ status: 'PENDING' }, {
                where: { id }
            })
            res.status(200).send({
                status: true,
                message: 'Payment Succesful'
            })
        } catch (err) {
            console.log(err)
            res.status(400).send(err);
        }
    },
    acceptPayment: async(req, res) => {
        try {
            await payroll.update({ status: 'PAID' }, {
                where: {
                    [Op.and]: [
                        { UserId: req.user.id }, 
                        { status: 'PENDING' }
                    ]
                }
            })
            res.status(200).send({
                status: true,
                message: 'Payment Succesful'
            })
        } catch (err) {
            res.status(400).send(err);
        }
    }
}
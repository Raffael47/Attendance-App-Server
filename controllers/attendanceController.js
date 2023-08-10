const db = require('../models');
const { sequelize } = require('../models');
const attendance = db.Attendance;
const user = db.User;
const shift = db.Shift;
const { Op, Sequelize } = require('sequelize');

module.exports = {
    clockIn: async(req, res) => {
        const transaction = await sequelize.transaction();
        try {
            const hour = new Date().getHours();
            const minute = new Date().getMinutes();
            const second = new Date().getSeconds();
            const clockIn = `${hour}:${minute}:${second}`;
            let onTime

            const date = new Date( Date.now() );
            const { Shift } = await user.findOne({
                where: { id: req.user.id },
                include: [{ model: shift }],
                transaction
            })
            console.log(Shift.shiftStart)
            if ( Shift?.shiftStart >= clockIn ) { onTime = true }
            else { onTime = false }

            const [ result ] = await attendance.findOrCreate({
                where: {
                    UserId: req.user.id,
                    status: 'ONGOING',
                    date
                },
                transaction
            });

            if ( !result.clockIn ) await attendance.update({ clockIn, onTime }, {
                where: {
                    [Op.and]: [
                        { UserId: req.user.id },
                        { status: 'ONGOING' },
                        { date }
                    ]
                },
                transaction
            });

            await transaction.commit();
            res.status(201).send({
                status: true,
                message: 'User has clocked in',
                result
            });

        } catch (err) {
            await transaction.rollback();
            console.log(err)
            res.status(400).send(err);
        }
    },
    clockOut: async(req, res) => {
        try {
            const hour = new Date().getHours();
            const minute = new Date().getMinutes();
            const second = new Date().getSeconds();
            const clockOut = `${hour}:${minute}:${second}`;

            const checkClockIn = await attendance.findOne({
                where: {
                    UserId: req.user.id,
                    status: 'ONGOING'
                }
            });

            if ( !checkClockIn ) throw { status: false, message: 'Clock in first' };

            await attendance.update({ clockOut, status: 'DONE' }, {
                where: {
                    UserId: req.user.id,
                    status: 'ONGOING'
                }
            });

            res.status(200).send({
                status: true,
                message: 'User has clocked out'
            });
        } catch (err) {
            res.status(400).send(err);
        }
    },
    getUserRecord: async(req, res) => {
        try {
            const username = req.params.username || "";
            const startDate = req.query.startDate || '0';
            const endDate = req.query.endDate || '2099';
            const sort = req.query.sort || "ASC";
            const orderBy = req.query.orderBy || "id";
            const limit = +req.query.limit || 10;
            const page = +req.query.page || 1;
            const userId = +req.query.userId || '';

            const filter = {
                where: {
                    date: {
                        [Op.between]: [
                            new Date (startDate),
                            new Date (endDate)
                        ]
                    },
                    UserId: {
                        [Op.like]: `%${userId}%`
                    }
                },
                include: [
                    {
                        model: user,
                        attributes: ['name', 'imgProfile'],
                        where: {
                            name: {[Op.like]: [`${username}%`]}
                        }
                    }
                ],
                order: [ [ Sequelize.col(orderBy), `${sort}` ] ],
                limit,
                offset: ( page - 1 ) * limit
            }

            const result = await attendance.findAll( filter );
            const total = await attendance.count( filter );
            const userInfo = await user.findOne({
                where: { id: userId },
                include: [{ model: shift }]
            })

            if (result[0] === undefined) throw { status: false, message: 'Data not found on the given range' };

            res.status(200).send({
                status: true,
                userInfo,
                limit,
                totalPage: Math.ceil(total / limit),
                currentPage: page,
                result
            });
        } catch (err) {
            res.status(404).send(err);
        }
    }
}
const db = require('../models');
const user = db.User;
const shift = db.Shift;
const role = db.Role;
const { Op, Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
const fs = require('fs');
const transporter = require('../middleware/transporter');
const handlebars = require('handlebars');

module.exports = {    
    editEmail: async(req, res) => {
        try {
            const { email } = req.body;

            const result = await user.findOne({ where: { id: req.user.id } });

            await user.update({ email }, { where: { id: req.user.id } });

            const data = await fs.readFileSync('./template/email.html', 'utf-8');
            const tempCompile = await handlebars.compile(data);
            const tempResult = tempCompile({ name: result.name });

            await transporter.sendMail({
                from: 'fabrizio.thegreen@gmail.com',
                to: result.email,
                subject: 'Verify Email',
                html: tempResult
            });
    
            res.status(200).send({
                status: true,
                message: 'Email updated'
            });
            
        } catch (err) {
            res.status(400).send(err);
        }
    },
    changePassword: async(req, res) => {
        try {
            const { currentPassword, password } = req.body
            const result = await user.findOne({  where: { id: req.user.id } });

            const isValid = await bcrypt.compare(currentPassword, result.password);
            if (!isValid) throw {message: 'Password is incorrect, please check again your password'};

            const salt = await bcrypt.genSalt(8);
            const hashPassword = await bcrypt.hash(password, salt);

            await user.update({ password: hashPassword }, { where: { id: req.user.id } });

            res.status(200).send({
                status: true, 
                message: 'Password updated'
            });

        } catch (err) {
            res.status(400).send(err);
        }
    },
    resetPassword: async(req, res) => {
        try {
            const { password } = req.body;

            const salt = await bcrypt.genSalt(8);
            const hashPassword = await bcrypt.hash(password, salt);

            await user.update({ password: hashPassword }, { where: { id: req.user.id } });

            res.status(200).send({
                status: true, 
                message: 'Reset password successful'
            });

        } catch (err) {
            res.status(400).send(err);
        }
    },
    uploadProfilePic: async(req, res) => {
        try {
            const { filename } = req.file;

            await user.update({ imgProfile: filename }, {
                where: {
                    id: req.user.id
                }
            });

            res.status(200).send({
                status: true,
                message: 'Profile picture updated'
            });

        } catch (err) {
            res.status(400).send(err);
        }
    },
    getAllUser: async(req, res) => {
        try {
            const username = req.params.username || "";
            const sort = req.query.sort || "ASC";
            const orderBy = req.query.orderBy || "id";
            const limit = +req.query.limit || 10;
            const page = +req.query.page || 1;
            const userId = +req.query.userId || '';
            const shiftId = req.query.shiftId || '';

            const filter = {
                where: {
                    name: {[Op.like]: [`${username}%`]},
                    id: {[Op.like]: [`${userId}%`]},
                    ShiftId: {[Op.like]: [`${shiftId}%`]},
                    isAdmin: false
                },
                order: [ [ Sequelize.col(orderBy), `${sort}` ] ],
                limit,
                offset: ( page - 1 ) * limit,
                include: [{ model: shift }, { model: role }]
            }
            const result = await user.findAll(filter)
            const total = await user.count(filter);

            if (result[0] === undefined) throw { status: false, message: 'Data not found on the given range' };

            res.status(200).send({
                status: true,
                limit,
                total,
                totalPage: Math.ceil(total / limit),
                currentPage: page,
                result
            });
        } catch (err) {
            console.log(err)
            res.status(400).send(err);
        }
    },
    getShift: async(req, res) => {
        try {
            const result = await shift.findAll();
            res.status(200).send({
                status: true,
                result
            })
        } catch (err) {
            res.status(404).send(err);
        }
    },
    getRoles: async(req, res) => {
        try {
            const result = await role.findAll();
            res.status(200).send({
                status: true,
                result
            })
        } catch (err) {
            res.status(404).send(err);
        }
    },
    editName: async(req, res) => {
        try {
            const { name } = req.body;
             await user.update({ name }, {
                where: {
                    id: req.user.id
                }
            });
    
            res.status(200).send({
                status: true,
                message: 'name updated'
            });
            
        } catch (err) {
            res.status(400).send(err);
        }
    },
    editBirthdate: async(req, res) => {
        try {
            const { birthdate } = req.body;
             await user.update({ birthdate }, {
                where: {
                    id: req.user.id
                }
            });
    
            res.status(200).send({
                status: true,
                message: 'birthdate updated'
            });
            
        } catch (err) {
            res.status(400).send(err);
        }
    },
    editShiftSalary: async(req, res) => {
        try {
            const { salary, ShiftId, id } = req.body;
            await user.update({ salary, ShiftId }, { where: { id } });
            res.status(200).send({
                status: true,
                message: 'Shift and Salary Updated'
            });
        } catch (err) {
            res.status(400).send(err);
        }
    }
};
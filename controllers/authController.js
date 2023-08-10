const db = require('../models');
const user = db.User;
const shift = db.Shift;
const role = db.Role;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const transporter = require('../middleware/transporter');
const handlebars = require('handlebars');
const fs = require('fs')

module.exports = {
    addUser: async(req, res) => {
        try {
            const { name, email, password, salary, ShiftId, RoleId, birthdate } = req.body;
            const salt = await bcrypt.genSalt(8);
            const hashPassword = await bcrypt.hash(password, salt);
            await user.create({ name, email, password: hashPassword, salary, ShiftId: +ShiftId, RoleId: +RoleId, birthdate: new Date(birthdate) });

            const payload = { id: result.id };
            const token = jwt.sign(payload, process.env.KEY_JWT, {expiresIn: '10m'});

            const data = await fs.readFileSync('./template/welcome.html', 'utf-8');
            const tempCompile = await handlebars.compile(data);
            const tempResult = tempCompile({
                name,
                password,
                link: `http://localhost:3000/reset-password/${token}`
            });

            await transporter.sendMail({
                from: 'fabrizio.thegreen@gmail.com',
                to: email,
                subject: 'Welcome',
                html: tempResult
            });

            res.status(201).send({
                status: true,
                message: 'User registered'
            });
        } catch (err) {
            console.log(err)
            res.status(400).send(err);
        }
    },
    login: async(req, res) => {
        try {
            const { email, password } = req.body;
            const result = await user.findOne({
                where: {
                    email
                }
            });
            if (!result) throw { status: false, message: 'User not found' };

            const isValid = await bcrypt.compare( password, result.password );
            if (!isValid) throw { status: false, message: 'Password incorrect' };
            const payload = { id: result.id, isAdmin: result.isAdmin };
            const token = jwt.sign( payload, process.env.KEY_JWT, { expiresIn: '1d' } );

            res.status(200).send({
                status: true, 
                message: 'Login succesful',
                result,
                token
            });
        } catch (err) {
            console.log(err)
            res.status(400).send(err);
        }
    },
    keepLogin: async(req, res) => {
        try {
            const result = await user.findOne({
                where: {
                    id: req.user.id
                },
                attributes: { exclude: [ 'updatedAt', 'password' ] },
                include: [
                    {
                        model: shift,
                        attributes: { exclude: ['id'] }
                    },
                    {
                        model: role
                    }
                ]
            });
            res.status(200).send({
                status: true,
                result
            })
        } catch (err) {
            res.status(404).send(err);
        }
    },
    forgotPassword: async(req, res) => {
        try {
            const { email } = req.body;

            const result = await user.findOne({ where: { email } });
            if (!result) throw { message: 'User not found' };
            
            const payload = { id: result.id };
            const token = jwt.sign(payload, process.env.KEY_JWT, {expiresIn: '10m'});

            const data = await fs.readFileSync('./template/password.html', 'utf-8');
            const tempCompile = await handlebars.compile(data);
            const tempResult = tempCompile({ 
                name: result.name,
                link: `http://localhost:3000/reset-password/${token}`
            });

            await transporter.sendMail({
                from: 'fabrizio.thegreen@gmail.com',
                to: email,
                subject: 'Reset Password',
                html: tempResult
            });
            
            res.status(200).send({
                status: true,
                message: 'Email sent',
                token
            })

        } catch (err) {
            res.status(400).send(err);
        }
    }
}
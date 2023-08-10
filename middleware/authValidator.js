const { body, validationResult } = require('express-validator');
const db = require('../models');
const user = db.User;

module.exports = {
    
    checkUsername: async(req, res, next) => {
        try {
            await body('name').notEmpty().matches(/^[A-Za-z .,']+$/).withMessage('Username must not be empty').run(req);
            const validation = validationResult(req);

            if (validation.isEmpty()) next()
            else throw { validation };
        } catch (err) {
            res.status(400).send(err)
        }
    },
    checkEmail: async(req, res, next) => {
        try {
            await body('email').notEmpty().withMessage('E-mail must not be empty').isEmail().run(req);
            const validation = validationResult(req);

            if (validation.isEmpty()) next()
            else throw { validation };
        } catch (err) {
            res.status(400).send(err)
        }
    },
    checkPassword: async(req, res, next) => {
        try {
            await body('password').notEmpty().isStrongPassword({
                minLength: 8,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 0,
                minSymbols: 1
            }).withMessage('Password must have at least 8 characters, 1 lowercase, 1 uppercase, and 1 symbol').run(req);
            
            const validation = validationResult(req);
            if (validation.isEmpty()) next()
            else throw { validation };
        } catch (err) {
            console.log(err)
            res.status(400).send(err)
        }
    },
    checkConfirmPassword: async(req, res, next) => {
        try {
            await body('confirmPassword').notEmpty().withMessage('Password must not be empty').equals(req.body.password).withMessage('Password does not match').run(req);
            
            const validation = validationResult(req);
            if (validation.isEmpty()) next()
            else throw { validation };
        } catch (err) {
            res.status(400).send(err)
        }
    },
    
    checkEmailExist: async(req, res, next) => {
        try {
            const { email } = req.body;
            const result = await user.findOne({ where: { email } });
            if (!result) next();
            else throw { status: false, message: 'Email has already been used' };
        } catch (err) {
            console.log(err)
            res.status(409).send(err);
        }
    },
    
    checkSalary: async(req, res, next) => {
        try {
            await body('salary').notEmpty().withMessage('Salary must not be empty').run(req);
            const validation = validationResult(req);

            if (validation.isEmpty()) next()
            else throw { validation };
        } catch (err) {
            console.log(err);
            res.status(400).send(err)
        }
    }
}

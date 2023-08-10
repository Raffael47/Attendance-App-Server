'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Attendance);
      User.belongsTo(models.Shift, {
        onUpdate: 'NOACTION'
      });
      User.belongsTo(models.Role,{
        onUpdate: 'NOACTION'
      });
      User.hasMany(models.Payroll);
    }
  }
  User.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      defaultValue: 'Abc123!',
      allowNull: false
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    imgProfile: {
      type: DataTypes.STRING
    },
    salary: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    birthdate: DataTypes.DATEONLY
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
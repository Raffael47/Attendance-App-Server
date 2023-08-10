'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payroll extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Payroll.belongsTo(models.User);
    }
  }
  Payroll.init({
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    tax: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    deduction: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    net: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM([ 'PAID', 'PENDING', 'UNPAID' ]),
      defaultValue: 'UNPAID',
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Payroll',
  });
  return Payroll;
};
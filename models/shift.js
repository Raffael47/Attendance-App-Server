'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Shift extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Shift.hasMany(models.User);
    }
  }
  Shift.init({
    shiftStart: {
      type: DataTypes.TIME,
      allowNull: false
    },
    shiftEnd: {
      type: DataTypes.TIME,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Shift',
    timestamps: false
  });
  return Shift;
};
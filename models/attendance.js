'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Attendance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Attendance.belongsTo(models.User);
    }
  }
  Attendance.init({
    clockIn: {
      type: DataTypes.TIME
    },
    clockOut: {
      type: DataTypes.TIME
    },
    status: {
      type: DataTypes.ENUM([ 'ONGOING', 'DONE' ]),
      defaultValue: 'ONGOING',
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    onTime: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Attendance',
    timestamps: false
  });
  return Attendance;
};
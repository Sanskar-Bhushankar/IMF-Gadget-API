// const { DataTypes } = require('sequelize');
// const { sequelize } = require('../config/database');

// const Gadget = sequelize.define('Gadget', {
//   id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   name: {
//     type: DataTypes.STRING,
//     allowNull: false
//   },
//   codename: {
//     type: DataTypes.STRING,
//     unique: true,
//     allowNull: false
//   },
//   description: {
//     type: DataTypes.TEXT,
//     defaultValue: 'No description provided'
//   },
//   status: {
//     type: DataTypes.STRING,
//     allowNull: false
//   }
// }, {
//   tableName: 'gadgets',
//   timestamps: false // If you don't have created_at/updated_at columns
// });

// module.exports = Gadget; 
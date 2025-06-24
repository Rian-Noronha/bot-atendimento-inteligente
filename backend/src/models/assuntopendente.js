'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AssuntoPendente extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  AssuntoPendente.init({
    texto_assunto: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'AssuntoPendente',
    tableName: 'assuntos_pendentes'
  });
  return AssuntoPendente;
};
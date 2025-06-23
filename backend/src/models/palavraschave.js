'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PalavrasChave extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PalavrasChave.init({
    palavra: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'PalavrasChave',
    tableName: 'palavras_chave'
  });
  return PalavrasChave;
};
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Documentos extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Documentos.init({
    titulo: DataTypes.STRING,
    descricao: DataTypes.STRING,
    solucao: DataTypes.STRING,
    ativo: DataTypes.BOOLEAN,
    urlArquivo: DataTypes.STRING,
    tipoDocumento: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Documentos',
    tableName: 'documentos'
  });
  return Documentos;
};
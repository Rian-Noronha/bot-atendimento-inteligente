'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Documento extends Model {
    static associate(models) {
      this.belongsToMany(models.PalavrasChave, {
        through: 'documentos_palavras_chave',
        foreignKey: 'documento_id',
        as: 'palavrasChave'
      });

      this.belongsTo(models.Subcategoria, {
        foreignKey: 'subcategoria_id',
        as: 'subcategoria'
      });

      this.hasMany(models.ChatResposta, {
        foreignKey: 'documento_fonte',
        as: 'respostasGeradas'
      });

    }
  }
  Documento.init({
    titulo: DataTypes.STRING,
    descricao: DataTypes.STRING,
    solucao: DataTypes.STRING,
    ativo: DataTypes.BOOLEAN,
    urlArquivo: DataTypes.STRING,
    tipoDocumento: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Documento',
    tableName: 'documentos'
  });
  return Documento;
};
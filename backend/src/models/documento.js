'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  // CORRIGIDO: Nome da classe para o singular
  class Documento extends Model {
    static associate(models) {
      this.belongsTo(models.Subcategoria, {
        foreignKey: 'subcategoria_id',
        as: 'subcategoria'
      });
      this.belongsToMany(models.PalavraChave, {
        through: 'documentos_palavras_chave',
        foreignKey: 'documento_id',
        as: 'palavrasChave'
      });
    }
  }
  Documento.init({
    titulo: DataTypes.STRING,
    descricao: DataTypes.STRING,
    solucao: DataTypes.STRING,
    ativo: DataTypes.BOOLEAN,
    urlArquivo: DataTypes.STRING,
    tipoDocumento: DataTypes.STRING,
    embedding: {
      type: DataTypes.VECTOR(768), 
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Documento', // CORRIGIDO: Nome do model para o singular
    tableName: 'documentos'
  });
  return Documento;
};
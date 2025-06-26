'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Subcategoria extends Model {
    static associate(models) {
      this.belongsTo(models.Categoria, {
        foreignKey: 'categoria_id', 
        as: 'categoria' 
      });
    }
  }
  Subcategoria.init({
    nome: DataTypes.STRING,
    descricao: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Subcategoria',
    tableName: 'subcategorias' 
  });
  return Subcategoria;
};

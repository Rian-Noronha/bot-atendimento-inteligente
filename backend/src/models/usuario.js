'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');
module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    static associate(models) {
      this.belongsTo(models.Perfil, {
        foreignKey: 'perfil_id',
        as: 'perfil'
      });
      this.hasMany(models.ChatSessao, {
        foreignKey: 'usuario_id',
        as: 'sessoes'
      });
    }
  }
  Usuario.init({
    nome: DataTypes.STRING,
    email: DataTypes.STRING,
    senha_hash: DataTypes.STRING,
    ativo: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Usuario',
    tableName: 'usuarios',
    hooks: {
      beforeCreate: async (usuario) => {
        if (usuario.senha_hash) {
          const salt = await bcrypt.genSalt(10);
          usuario.senha_hash = await bcrypt.hash(usuario.senha_hash, salt);
        }
      }
    }
    
  });


  
  return Usuario;
};
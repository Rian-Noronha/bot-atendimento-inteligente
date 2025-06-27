'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChatSessao extends Model {
    static associate(models) {
      this.belongsTo(models.Usuario, {
        foreignKey: 'usuario_id',
        as: 'usuario'
      });

      this.hasMany(models.ChatConsulta, {
        foreignKey: 'sessao_id',
        as: 'consultas'
      });
    }
  }
  ChatSessao.init({
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    registro_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    registro_fim: {
      type: DataTypes.DATE,
      allowNull: true 
    }
  }, {
    sequelize,
    modelName: 'ChatSessao',
    tableName: 'chat_sessoes'
  });
  return ChatSessao;
};
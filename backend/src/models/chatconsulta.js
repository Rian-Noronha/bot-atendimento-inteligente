'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChatConsulta extends Model {
    static associate(models) {
      this.belongsTo(models.ChatSessao, {
        foreignKey: 'sessao_id',
        as: 'sessao'
      });

      this.hasOne(models.ChatResposta, {
        foreignKey: 'consulta_id',
        as: 'resposta'
      });
    }
  }
  ChatConsulta.init({
    pergunta: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ChatConsulta',
    tableName: 'chat_consultas'
  });
  return ChatConsulta;
};
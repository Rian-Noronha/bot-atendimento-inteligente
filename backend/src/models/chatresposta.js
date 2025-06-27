'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChatResposta extends Model {
    static associate(models) {
      this.belongsTo(models.ChatConsulta, {
        foreignKey: 'consulta_id',
        as: 'consulta'
      });

      this.belongsTo(models.Documento, {
        foreignKey: 'documento_fonte',
        as: 'fonte'
      });
    }
  }
  ChatResposta.init({
    texto_resposta: DataTypes.STRING,
    consulta_id: DataTypes.INTEGER,
    documento_fonte: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ChatResposta',
    tableName: 'chat_respostas'
  });
  return ChatResposta;
};
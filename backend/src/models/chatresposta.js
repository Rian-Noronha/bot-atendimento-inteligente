'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChatResposta extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ChatResposta.init({
    textoResposta: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ChatResposta',
    tableName: 'chat_respostas'
  });
  return ChatResposta;
};
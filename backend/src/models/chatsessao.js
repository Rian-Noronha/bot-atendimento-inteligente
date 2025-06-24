'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChatSessao extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ChatSessao.init({
  }, {
    sequelize,
    modelName: 'ChatSessao',
    tableName: 'chat_sessoes'
  });
  return ChatSessao;
};
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

  // 1. Função auxiliar para criptografar a senha
  const hashPassword = async (usuario) => {
    // A função 'changed' do Sequelize verifica se o valor de um campo foi alterado.
    // Isso garante que a criptografia só rode se a senha for nova ou modificada.
    if (usuario.changed('senha_hash') && usuario.senha_hash) {
      const salt = await bcrypt.genSalt(10);
      usuario.senha_hash = await bcrypt.hash(usuario.senha_hash, salt);
    }
  };

  Usuario.init({
    nome: DataTypes.STRING,
    email: DataTypes.STRING,
    senha_hash: DataTypes.STRING,
    ativo: DataTypes.BOOLEAN,
    // 2. Adiciona os campos da migration ao model para que o Sequelize os reconheça
    reset_password_token: DataTypes.STRING,
    reset_password_expires: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Usuario',
    tableName: 'usuarios',
    // 3. Atualiza o objeto de hooks para usar a função nos dois eventos
    hooks: {
      beforeCreate: hashPassword,
      beforeUpdate: hashPassword // <-- Hook que faltava, agora adicionado.
    }
  });

  return Usuario;
};
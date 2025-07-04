'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const senhaPlana = 'Verdecard@2025';
    const salt = bcrypt.genSaltSync(10);
    const senhaHash = bcrypt.hashSync(senhaPlana, salt);

    await queryInterface.bulkInsert('usuarios', [{
      nome: 'Mariana Wolff de Souza',
      email: 'mariana.souza@verdecard.com.br',
      senha_hash: senhaHash,
      perfil_id: 1, 
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuarios', { email: 'maria.souza@verdecard.com.br' }, {});
  }
};
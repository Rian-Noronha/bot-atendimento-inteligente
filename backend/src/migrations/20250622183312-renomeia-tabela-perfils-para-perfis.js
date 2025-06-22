'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Comando para renomear a tabela de 'Perfils' para 'perfis'
    // É uma boa prática usar nomes de tabela em minúsculo.
    await queryInterface.renameTable('Perfils', 'perfis');
  },

  async down (queryInterface, Sequelize) {
    // Comando para DESFAZER a alteração, caso você precise reverter a migration.
    await queryInterface.renameTable('perfis', 'Perfils');
  }
};
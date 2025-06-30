'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('subcategorias', [

      {
          nome: 'Bloqueio',
          descricao: 'Subcategoria relacionada à categoria Cartão.',
          categoria_id: 1,
          createdAt: new Date(),
          updatedAt: new Date()
      },

      {
          nome: 'Empréstimo',
          descricao: 'Subcategoria relacionada à categoria Cartão.',
          categoria_id: 1,
          createdAt: new Date(),
          updatedAt: new Date()
      },

      {
          nome: 'Data Base',
          descricao: 'Subcategoria relacionada à categoria Cartão.',
          categoria_id: 1,
          createdAt: new Date(),
          updatedAt: new Date()
      },

      {
        nome: 'Chamados',
        descricao: 'Subcategoria relacionada à categoria SAC.',
        categoria_id: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.bulkDelete('subcategorias', null, {});
  }

};

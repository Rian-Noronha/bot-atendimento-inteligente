'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('assuntos_pendentes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      texto_assunto: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false
      },
      consulta_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'chat_consultas',
          key: 'id'
        }
      },

      subcategoria_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
          references: {
            model: 'subcategorias',
            key: 'id'
          }
      },
      
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('assuntos_pendentes');
  }
};
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('chat_consultas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      
      pergunta: {
        type: Sequelize.STRING,
        allowNull: false
      },

      sessao_id : {

        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'chat_sessoes',
          key: 'id'
        },

        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
        
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
    await queryInterface.dropTable('chat_consultas');
  }
};
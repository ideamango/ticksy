import { Sequelize, DataTypes } from 'sequelize';
import path from 'path';

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'ticksy.sqlite'),
  logging: false,
});

export const User = sequelize.define('User', {
  userId: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
}, {
  timestamps: true,
});

export const List = sequelize.define('List', {
  listId: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  ownerId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sharedWith: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  categoryId: {
    type: DataTypes.STRING,
  },
  emoji: {
    type: DataTypes.STRING,
  },
  items: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
}, {
  timestamps: true,
});

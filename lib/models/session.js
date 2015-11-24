// Sequelize CleverSession model
module.exports = function (DataTypes) {
  return {
    sid: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    expires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    data: DataTypes.TEXT
  }
}

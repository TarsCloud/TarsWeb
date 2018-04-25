/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('t_user_info', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		user_name: {
			type: DataTypes.STRING(256),
			allowNull: false,
			unique: true
		},
		password: {
			type: DataTypes.STRING(256),
			allowNull: false
		}
	}, {
		tableName: 't_user_info',
		timestamps: false
	});
};

/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('t_login_temp_info', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		ticket: {
			type: DataTypes.STRING(256),
			allowNull: true
		},
		uid: {
			type: DataTypes.STRING(256),
			allowNull: true
		},
		expire_time: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		}
	}, {
		tableName: 't_login_temp_info',
		timestamps: false
	});
};

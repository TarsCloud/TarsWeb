/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('t_server_user', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		application: {
			type: DataTypes.STRING(128),
			allowNull: false
		},
		server_name: {
			type: DataTypes.STRING(128),
			allowNull: false
		},
		read_role: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		write_role: {
			type: DataTypes.TEXT,
			allowNull: true
		}
	}, {
		tableName: 't_server_user',
		timestamps: false
	});
};

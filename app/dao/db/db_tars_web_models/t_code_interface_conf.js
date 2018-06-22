/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('t_code_interface_conf', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		server: {
			type: DataTypes.STRING(50),
			allowNull: false,
			primaryKey: true
		},
		path: {
			type: DataTypes.STRING(256),
			allowNull: false,
			defaultValue: ''
		}
	}, {
		tableName: 't_code_interface_conf',
		timestamps: false
	});
};

/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('t_config_history_files', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		configid: {
			type: DataTypes.INTEGER(11),
			allowNull: true
		},
		reason: {
			type: DataTypes.STRING(128),
			allowNull: true,
			defaultValue: ''
		},
		reason_select: {
			type: DataTypes.STRING(20),
			allowNull: false,
			defaultValue: ''
		},
		content: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		posttime: {
			type: DataTypes.DATE,
			allowNull: true
		},
		lastuser: {
			type: DataTypes.STRING(50),
			allowNull: true
		}
	}, {
		tableName: 't_config_history_files',
		timestamps: false
	});
};

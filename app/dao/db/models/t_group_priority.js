/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('t_group_priority', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		name: {
			type: DataTypes.STRING(128),
			allowNull: true,
			defaultValue: ''
		},
		group_list: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		list_order: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: '0'
		},
		station: {
			type: DataTypes.STRING(128),
			allowNull: false,
			defaultValue: ''
		}
	}, {
		tableName: 't_group_priority',
		timestamps: false
	});
};

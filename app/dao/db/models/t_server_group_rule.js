/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('t_server_group_rule', {
		group_id: {
			type: DataTypes.INTEGER(10).UNSIGNED,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		ip_order: {
			type: DataTypes.ENUM('allow_denny','denny_allow'),
			allowNull: false,
			defaultValue: 'denny_allow'
		},
		allow_ip_rule: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		denny_ip_rule: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		lastuser: {
			type: DataTypes.STRING(50),
			allowNull: true
		},
		modify_time: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		group_name: {
			type: DataTypes.STRING(128),
			allowNull: true,
			defaultValue: '',
			unique: true
		},
		group_name_cn: {
			type: DataTypes.STRING(128),
			allowNull: true,
			defaultValue: ''
		}
	}, {
		tableName: 't_server_group_rule',
		timestamps: false
	});
};

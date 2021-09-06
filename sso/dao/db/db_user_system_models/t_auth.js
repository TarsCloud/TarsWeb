/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('t_auth', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		flag: {
			type: DataTypes.STRING(128),
			allowNull: true
		},
		role: {
			type: DataTypes.STRING(128),
			allowNull: true
		},
		uid: {
			type: DataTypes.STRING(128),
			allowNull: true
		},
		create_time: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		update_time: {
			type: DataTypes.DATE,
			allowNull: true
		}
	}, {
		tableName: 't_auth',
		timestamps: false
	});
};

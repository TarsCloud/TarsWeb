/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('t_token', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		uid: {
			type: DataTypes.STRING(64),
			allowNull: true,
		},
		token: {
			type: DataTypes.STRING(255),
			allowNull: false,
			unique: 'token'
		},
		valid: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		expire_time: {
			type: DataTypes.DATE,
			allowNull: false			
		},
		update_time: {
			type: DataTypes.DATE,
			allowNull: false			
		}
	}, {
		tableName: 't_token',
		timestamps: false
	});
};

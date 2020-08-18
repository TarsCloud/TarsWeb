/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('t_user_info', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		uid: {
			type: DataTypes.STRING(128),
			allowNull: true,
			unique: 'uid'
		},
		password: {
			type: DataTypes.STRING(128),
			allowNull: false
		},
		update_time: {
			type: DataTypes.DATE,
			allowNull: false			
		}
	}, {
		tableName: 't_user_info',
		timestamps: false
	});
};

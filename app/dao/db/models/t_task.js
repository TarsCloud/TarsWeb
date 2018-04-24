/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('t_task', {
		id: {
			type: DataTypes.INTEGER(11).UNSIGNED,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		task_no: {
			type: DataTypes.STRING(40),
			allowNull: true,
			unique: true
		},
		serial: {
			type: DataTypes.INTEGER(1),
			allowNull: true
		},
		user_name: {
			type: DataTypes.STRING(20),
			allowNull: true
		},
		create_time: {
			type: DataTypes.DATE,
			allowNull: true
		}
	}, {
		tableName: 't_task',
		timestamps: false
	});
};

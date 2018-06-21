/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('t_patch_task', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		server: {
			type: DataTypes.STRING(50),
			allowNull: true
		},
		tgz: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		task_id: {
			type: DataTypes.STRING(64),
			allowNull: true
		}
	}, {
		tableName: 't_patch_task',
		timestamps: false
	});
};

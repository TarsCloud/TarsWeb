/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('t_thirdcompile_conf', {
		f_id: {
			type: DataTypes.INTEGER(1),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		f_taglist_uri: {
			type: DataTypes.STRING(512),
			allowNull: false,
			defaultValue: ''
		},
		f_compile_uri: {
			type: DataTypes.STRING(512),
			allowNull: false,
			defaultValue: ''
		},
		f_compile_task_uri: {
			type: DataTypes.STRING(512),
			allowNull: false,
			defaultValue: ''
		}
	}, {
		tableName: 't_thirdcompile_conf',
		timestamps: false
	});
};

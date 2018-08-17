/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('t_tars_files', {
		f_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			autoIncrement: true,
			unique: true
		},
		application: {
			type: DataTypes.STRING(64),
			allowNull: false,
			defaultValue: ''
		},
		server_name: {
			type: DataTypes.STRING(128),
			allowNull: false,
			defaultValue: '',
			primaryKey: true
		},
		file_name: {
			type: DataTypes.STRING(64),
			allowNull: false,
			defaultValue: '',
			primaryKey: true
		},
		posttime: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		context: {
			type: DataTypes.TEXT,
			allowNull: true
		}
	}, {
		tableName: 't_tars_files',
		timestamps: false
	});
};

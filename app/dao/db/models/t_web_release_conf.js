/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('t_web_release_conf', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		server: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: ''
		},
		path: {
			type: DataTypes.STRING(200),
			allowNull: false,
			defaultValue: ''
		},
		server_dir: {
			type: DataTypes.STRING(200),
			allowNull: false,
			defaultValue: ''
		},
		is_server_group: {
			type: DataTypes.INTEGER(2),
			allowNull: false,
			defaultValue: '0'
		},
		enable_batch: {
			type: DataTypes.INTEGER(2),
			allowNull: false,
			defaultValue: '0'
		},
		user: {
			type: DataTypes.STRING(200),
			allowNull: false,
			defaultValue: '*'
		},
		posttime: {
			type: DataTypes.DATE,
			allowNull: true
		},
		lastuser: {
			type: DataTypes.STRING(60),
			allowNull: true
		}
	}, {
		tableName: 't_web_release_conf',
		timestamps: false
	});
};

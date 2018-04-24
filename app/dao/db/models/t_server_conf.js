/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('t_server_conf', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		application: {
			type: DataTypes.STRING(128),
			allowNull: true,
			defaultValue: ''
		},
		server_name: {
			type: DataTypes.STRING(128),
			allowNull: true,
			defaultValue: ''
		},
		node_group: {
			type: DataTypes.STRING(50),
			allowNull: false,
			defaultValue: ''
		},
		node_name: {
			type: DataTypes.STRING(50),
			allowNull: false,
			defaultValue: ''
		},
		registry_timestamp: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		base_path: {
			type: DataTypes.STRING(128),
			allowNull: true,
			defaultValue: ''
		},
		exe_path: {
			type: DataTypes.STRING(128),
			allowNull: false,
			defaultValue: ''
		},
		template_name: {
			type: DataTypes.STRING(128),
			allowNull: false,
			defaultValue: ''
		},
		bak_flag: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0'
		},
		setting_state: {
			type: DataTypes.ENUM('active','inactive'),
			allowNull: false,
			defaultValue: 'inactive'
		},
		present_state: {
			type: DataTypes.ENUM('active','inactive','activating','deactivating','destroyed'),
			allowNull: false,
			defaultValue: 'inactive'
		},
		process_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0'
		},
		patch_version: {
			type: DataTypes.STRING(128),
			allowNull: false,
			defaultValue: ''
		},
		patch_time: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: '0000-00-00 00:00:00'
		},
		patch_user: {
			type: DataTypes.STRING(128),
			allowNull: false,
			defaultValue: ''
		},
		tars_version: {
			type: DataTypes.STRING(128),
			allowNull: false,
			defaultValue: ''
		},
		posttime: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: '0000-00-00 00:00:00'
		},
		lastuser: {
			type: DataTypes.STRING(30),
			allowNull: true
		},
		server_type: {
			type: DataTypes.ENUM('tars_cpp','not_tars','tars_java','tars_nodejs'),
			allowNull: false,
			defaultValue: 'tars_cpp'
		},
		start_script_path: {
			type: DataTypes.STRING(128),
			allowNull: true
		},
		stop_script_path: {
			type: DataTypes.STRING(128),
			allowNull: true
		},
		monitor_script_path: {
			type: DataTypes.STRING(128),
			allowNull: true
		},
		enable_group: {
			type: DataTypes.CHAR(1),
			allowNull: true,
			defaultValue: 'N'
		},
		enable_set: {
			type: DataTypes.CHAR(1),
			allowNull: false,
			defaultValue: 'N'
		},
		set_name: {
			type: DataTypes.STRING(16),
			allowNull: true
		},
		set_area: {
			type: DataTypes.STRING(16),
			allowNull: true
		},
		set_group: {
			type: DataTypes.STRING(64),
			allowNull: true
		},
		ip_group_name: {
			type: DataTypes.STRING(64),
			allowNull: true
		},
		profile: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		config_center_port: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0'
		},
		async_thread_num: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: '3'
		},
		server_important_type: {
			type: DataTypes.ENUM('0','1','2','3','4','5'),
			allowNull: true,
			defaultValue: '0'
		},
		remote_log_reserve_time: {
			type: DataTypes.STRING(32),
			allowNull: false,
			defaultValue: '65'
		},
		remote_log_compress_time: {
			type: DataTypes.STRING(32),
			allowNull: false,
			defaultValue: '2'
		},
		remote_log_type: {
			type: DataTypes.INTEGER(1),
			allowNull: false,
			defaultValue: '0'
		}
	}, {
		tableName: 't_server_conf',
		timestamps: false
	});
};

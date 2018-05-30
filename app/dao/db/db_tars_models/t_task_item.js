/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('t_task_item', {
		id: {
			type: DataTypes.INTEGER(11).UNSIGNED,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		task_no: {
			type: DataTypes.STRING(40),
			allowNull: true
		},
		item_no: {
			type: DataTypes.STRING(40),
			allowNull: true
		},
		application: {
			type: DataTypes.STRING(30),
			allowNull: true
		},
		server_name: {
			type: DataTypes.STRING(50),
			allowNull: true
		},
		node_name: {
			type: DataTypes.STRING(20),
			allowNull: true
		},
		command: {
			type: DataTypes.STRING(20),
			allowNull: true
		},
		parameters: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		start_time: {
			type: DataTypes.DATE,
			allowNull: true
		},
		end_time: {
			type: DataTypes.DATE,
			allowNull: true
		},
		status: {
			type: DataTypes.INTEGER(11),
			allowNull: true
		},
		set_name: {
			type: DataTypes.STRING(20),
			allowNull: true
		},
		log: {
			type: DataTypes.TEXT,
			allowNull: true
		}
	}, {
		tableName: 't_task_item',
		timestamps: false
	});
};

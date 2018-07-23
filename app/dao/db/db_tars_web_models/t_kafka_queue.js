/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('t_kafka_queue', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		topic: {
			type: DataTypes.STRING(16),
			allowNull: false,
			defaultValue: ''
		},
		partition: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0'
		},
		offset: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0'
		},
		task_no: {
			type: DataTypes.STRING(64),
			allowNull: false,
			defaultValue: '',
			primaryKey: true
		},
		status: {
			type: DataTypes.STRING(16),
			allowNull: false,
			defaultValue: 'waiting',
			primaryKey: true
		},
		message: {
			type: DataTypes.STRING(256),
			allowNull: true,
			defaultValue: ''
		}
	}, {
		tableName: 't_kafka_queue',
		timestamps: false
	});
};

/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('t_tracing_span', {
		primary_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		trace_id: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		span_id: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		name: {
			type: DataTypes.STRING(64),
			allowNull: false
		},
		status: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0'
		},
		my_timestamp: {
			type: DataTypes.BIGINT,
			allowNull: true
		},
		duration: {
			type: DataTypes.BIGINT,
			allowNull: true
		},
		client_endpoint_ipv4: {
			type: DataTypes.STRING(64),
			allowNull: true
		},
		client_endpoint_port: {
			type: DataTypes.INTEGER(6),
			allowNull: true
		},
		client_endpoint_service_name: {
			type: DataTypes.STRING(255),
			allowNull: true
		},
		server_endpoint_ipv4: {
			type: DataTypes.STRING(64),
			allowNull: true
		},
		server_endpoint_port: {
			type: DataTypes.INTEGER(6),
			allowNull: true
		},
		server_endpoint_service_name: {
			type: DataTypes.STRING(255),
			allowNull: true
		},
		my_type: {
			type: DataTypes.STRING(10),
			allowNull: false,
			defaultValue: 'TARS'
		},
		layer: {
			type: DataTypes.INTEGER(11),
			allowNull: true
		},
		parent_id: {
			type: DataTypes.STRING(255),
			allowNull: false
		}
	}, {
		tableName: 't_tracing_span',
		timestamps: false
	});
};

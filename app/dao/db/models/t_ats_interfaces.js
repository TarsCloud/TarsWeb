/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('t_ats_interfaces', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		objname: {
			type: DataTypes.STRING(150),
			allowNull: true
		},
		funcname: {
			type: DataTypes.STRING(150),
			allowNull: true
		},
		retype: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		paramtype: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		outparamtype: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		interfaceid: {
			type: DataTypes.INTEGER(11),
			allowNull: true
		},
		postime: {
			type: DataTypes.DATE,
			allowNull: true
		},
		lastuser: {
			type: DataTypes.STRING(30),
			allowNull: true
		},
		request_charset: {
			type: DataTypes.STRING(16),
			allowNull: false
		},
		response_charset: {
			type: DataTypes.STRING(16),
			allowNull: false
		}
	}, {
		tableName: 't_ats_interfaces',
		timestamps: false
	});
};

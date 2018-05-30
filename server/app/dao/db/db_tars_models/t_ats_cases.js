/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('t_ats_cases', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		casename: {
			type: DataTypes.STRING(20),
			allowNull: true
		},
		retvalue: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		paramvalue: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		interfaceid: {
			type: DataTypes.INTEGER(11),
			allowNull: true
		},
		posttime: {
			type: DataTypes.DATE,
			allowNull: true
		},
		lastuser: {
			type: DataTypes.STRING(30),
			allowNull: true
		}
	}, {
		tableName: 't_ats_cases',
		timestamps: false
	});
};

/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('t_setting', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		uid: {
			type: DataTypes.STRING(128),
			allowNull: true,
		},
		title: {
			type: DataTypes.STRING(128),
			allowNull: true,
			unique: 'title' 
		},
		info: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		about_cn: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		about_en: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		valid: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		update_time: {
			type: DataTypes.DATE,
			allowNull: true
		}
	}, {
		tableName: 't_setting',
		timestamps: false
	});
};

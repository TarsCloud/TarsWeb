/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('t_profile_template', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		template_name: {
			type: DataTypes.STRING(128),
			allowNull: true,
			defaultValue: '',
			unique: true
		},
		parents_name: {
			type: DataTypes.STRING(128),
			allowNull: true,
			defaultValue: ''
		},
		profile: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		posttime: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: '0000-00-00 00:00:00'
		},
		lastuser: {
			type: DataTypes.STRING(30),
			allowNull: true
		}
	}, {
		tableName: 't_profile_template',
		timestamps: false
	});
};

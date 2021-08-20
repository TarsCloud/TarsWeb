/**
 * Tencent is pleased to support the open source community by making Tars available.
 *
 * Copyright (C) 2016THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the BSD 3-Clause License (the "License"); you may not use this file except 
 * in compliance with the License. You may obtain a copy of the License at
 *
 * https://opensource.org/licenses/BSD-3-Clause
 *
 * Unless required by applicable law or agreed to in writing, software distributed 
 * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR 
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the 
 * specific language governing permissions and limitations under the License.
 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_upstream', {
    f_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    f_upstream: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    f_addr: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ''
    },
    f_weight: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      defaultValue: '1'
    },
    f_fusing_onoff: {
      type: DataTypes.INTEGER(2),
      allowNull: false,
      defaultValue: '1'
    },
    f_valid: {
      type: DataTypes.INTEGER(2),
      allowNull: false,
      defaultValue: '1'
    },
    f_update_person: {
      type: DataTypes.STRING(64),
      allowNull: false,
      defaultValue: ''
    },
    f_update_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 't_upstream',
    timestamps: false,
		indexes: [{
		  name: 'station_addr',
		  unique: true,
		  fields: [`f_upstream`, `f_addr`]
		}]
  });
};

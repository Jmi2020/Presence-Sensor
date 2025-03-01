import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import Pod from './Pod';

// Define interface for OccupantLog attributes
interface OccupantLogAttributes {
  id: number;
  podId: number;
  podExternalId: string;
  occupantId: string | null;
  mmwaveDetected: boolean;
  bleDetected: boolean;
  rssi: number | null;
  isOccupied: boolean;
  // New sensor fields
  staticDistance?: number;
  motionDistance?: number;
  existenceEnergy?: number;
  motionEnergy?: number;
  motionSpeed?: number;
  bodyMovement?: number;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Define interface for OccupantLog creation attributes
interface OccupantLogCreationAttributes extends Optional<OccupantLogAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class OccupantLog extends Model<OccupantLogAttributes, OccupantLogCreationAttributes> implements OccupantLogAttributes {
  public id!: number;
  public podId!: number;
  public podExternalId!: string;
  public occupantId!: string | null;
  public mmwaveDetected!: boolean;
  public bleDetected!: boolean;
  public rssi!: number | null;
  public isOccupied!: boolean;
  // New sensor fields
  public staticDistance?: number;
  public motionDistance?: number;
  public existenceEnergy?: number;
  public motionEnergy?: number;
  public motionSpeed?: number;
  public bodyMovement?: number;
  public timestamp!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OccupantLog.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  podId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Pod,
      key: 'id'
    }
  },
  podExternalId: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  occupantId: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  mmwaveDetected: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  bleDetected: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  rssi: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  isOccupied: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  // New sensor fields
  staticDistance: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  motionDistance: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  existenceEnergy: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  motionEnergy: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  motionSpeed: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  bodyMovement: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  }
}, {
  sequelize,
  tableName: 'occupant_logs',
  timestamps: true,
  indexes: [
    {
      name: 'idx_occupant_logs_podid',
      fields: ['podId']
    },
    {
      name: 'idx_occupant_logs_timestamp',
      fields: ['timestamp']
    },
    {
      name: 'idx_occupant_logs_pod_timestamp',
      fields: ['podId', 'timestamp']
    }
  ]
});

// Define associations
Pod.hasMany(OccupantLog, { foreignKey: 'podId', as: 'logs' });
OccupantLog.belongsTo(Pod, { foreignKey: 'podId', as: 'pod' });

export default OccupantLog;
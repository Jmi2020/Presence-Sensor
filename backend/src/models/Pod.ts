import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// Define interface for Pod attributes
interface PodAttributes {
  id: number;
  podId: string;
  name: string;
  location: string;
  isOccupied: boolean;
  lastOccupantId: string | null;
  lastMmwaveDetection: boolean;
  lastBleDetection: boolean;
  lastRssi: number | null;
  lastUpdated: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define interface for Pod creation attributes
interface PodCreationAttributes extends Optional<PodAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Pod extends Model<PodAttributes, PodCreationAttributes> implements PodAttributes {
  public id!: number;
  public podId!: string;
  public name!: string;
  public location!: string;
  public isOccupied!: boolean;
  public lastOccupantId!: string | null;
  public lastMmwaveDetection!: boolean;
  public lastBleDetection!: boolean;
  public lastRssi!: number | null;
  public lastUpdated!: Date;
  public isActive!: boolean;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Pod.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  podId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  isOccupied: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  lastOccupantId: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  lastMmwaveDetection: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  lastBleDetection: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  lastRssi: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  lastUpdated: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
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
  tableName: 'pods',
  timestamps: true,
});

export default Pod;
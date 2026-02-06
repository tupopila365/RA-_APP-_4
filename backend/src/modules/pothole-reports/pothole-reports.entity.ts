import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('pothole_reports')
@Index(['deviceId', 'createdAt'])
@Index(['userId', 'createdAt'])
@Index(['userEmail', 'createdAt'])
@Index(['status', 'createdAt'])
@Index(['region', 'town'])
@Index(['createdAt'])
@Index(['referenceCode'], { unique: true })
export class PotholeReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  deviceId: string;

  /**
   * SECURITY FIX: userId is the primary ownership identifier
   * Links report to authenticated user via JWT userId
   */
  @Column({ type: 'int', nullable: true })
  userId: number | null;

  /**
   * Keep userEmail for backward compatibility and device-based fallback
   * But userId is the authoritative ownership field
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  userEmail: string | null;

  @Column({ type: 'varchar', length: 100, unique: true })
  referenceCode: string;

  @Column('simple-json')
  location: { latitude: number; longitude: number };

  @Column({ type: 'varchar', length: 200 })
  town: string;

  @Column({ type: 'varchar', length: 200 })
  region: string;

  @Column({ type: 'varchar', length: 200 })
  roadName: string;

  @Column({ type: 'varchar', length: 2000 })
  photoUrl: string;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  severity: 'low' | 'medium' | 'high' | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  description: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'pending' })
  status: 'pending' | 'assigned' | 'in-progress' | 'fixed' | 'duplicate' | 'invalid';

  @Column({ type: 'varchar', length: 255, nullable: true })
  assignedTo: string | null;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  adminNotes: string | null;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  repairPhotoUrl: string | null;

  @Column({ type: 'datetime', nullable: true })
  fixedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


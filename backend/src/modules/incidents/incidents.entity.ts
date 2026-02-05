import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('incidents')
@Index(['status'])
@Index(['road', 'status', 'reportedAt'])
@Index(['area', 'status', 'reportedAt'])
@Index(['type', 'status'])
export class Incident {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'nvarchar', length: 50 })
  type: 'Accident' | 'Road closure' | 'Hazard' | 'Debris' | 'Flooding';

  @Column({ type: 'varchar', length: 50 })
  road: string;

  @Column({ type: 'varchar', length: 300 })
  locationDescription: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  area: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'Active' })
  status: 'Active' | 'Cleared';

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  severity: 'Low' | 'Medium' | 'High' | null;

  @Column({ type: 'datetime' })
  reportedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  expectedClearance: Date | null;

  @Column('simple-json', { nullable: true })
  coordinates: { latitude: number; longitude: number } | null;

  @Column({ type: 'nvarchar', length: 20, default: 'official' })
  source: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  createdBy: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  updatedBy: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


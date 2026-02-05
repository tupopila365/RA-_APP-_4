import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('roadworks')
@Index(['road', 'status', 'startDate'])
@Index(['area', 'status'])
@Index(['region', 'status'])
@Index(['published', 'status'])
@Index(['priority', 'status'])
export class Roadwork {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 50 })
  road: string;

  @Column({ type: 'varchar', length: 300 })
  section: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  area: string | null;

  @Column({ type: 'varchar', length: 50 })
  region: string;

  @Column({ type: 'nvarchar', length: 30, default: 'Planned' })
  status: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  description: string | null;

  @Column({ type: 'datetime', nullable: true })
  startDate: Date | null;

  @Column({ type: 'datetime', nullable: true })
  endDate: Date | null;

  @Column({ type: 'datetime', nullable: true })
  expectedCompletion: Date | null;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  alternativeRoute: string | null;

  @Column('simple-json', { nullable: true })
  coordinates: { latitude: number; longitude: number } | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  affectedLanes: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  contractor: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  estimatedDuration: string | null;

  @Column('int', { nullable: true })
  expectedDelayMinutes: number | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  trafficControl: string | null;

  @Column({ default: false })
  published: boolean;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  priority: 'low' | 'medium' | 'high' | 'critical' | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  createdBy: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  createdByEmail: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  updatedBy: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  updatedByEmail: string | null;

  @Column('simple-json', { nullable: true })
  roadClosure: Record<string, unknown> | null;

  @Column('simple-json', { default: '[]' })
  alternateRoutes: unknown[];

  @Column('simple-json', { default: '[]' })
  changeHistory: unknown[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


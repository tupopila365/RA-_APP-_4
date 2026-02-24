import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type RoadStatusStatus = 'open' | 'caution' | 'maintenance' | 'closed';

@Entity('road_status')
@Index(['region', 'status'])
@Index(['published'])
export class RoadStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'nvarchar', length: 200 })
  name: string;

  @Column({ type: 'nvarchar', length: 100 })
  region: string;

  @Column({ type: 'nvarchar', length: 30, default: 'open' })
  status: RoadStatusStatus;

  @Column({ type: 'float' })
  lat: number;

  @Column({ type: 'float' })
  lng: number;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  notes: string | null;

  @Column({ default: true })
  published: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

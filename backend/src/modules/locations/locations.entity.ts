import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('locations')
@Index(['region'])
@Index(['name'])
@Index(['createdAt'])
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 500 })
  address: string;

  @Column({ type: 'varchar', length: 100 })
  region: string;

  @Column('simple-json')
  coordinates: { latitude: number; longitude: number };

  @Column({ type: 'varchar', length: 50, nullable: true })
  contactNumber: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string | null;

  @Column('simple-json', { nullable: true })
  services: string[] | null;

  @Column('simple-json', { nullable: true })
  operatingHours: {
    weekdays?: { open: string; close: string };
    weekends?: { open: string; close: string };
    publicHolidays?: { open: string; close: string };
  } | null;

  @Column('simple-json', { nullable: true })
  closedDays: string[] | null;

  @Column('simple-json', { nullable: true })
  specialHours: Array<{
    date: string;
    reason: string;
    closed: boolean;
    hours?: { open: string; close: string };
  }> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


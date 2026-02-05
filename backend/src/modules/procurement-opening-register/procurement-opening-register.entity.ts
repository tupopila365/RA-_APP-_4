import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('procurement_opening_registers')
@Index(['reference'], { unique: true })
@Index(['type'])
@Index(['status'])
@Index(['category'])
@Index(['published'])
@Index(['bidOpeningDate'])
@Index(['createdAt'])
@Index(['publishedAt'])
export class ProcurementOpeningRegister {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'nvarchar', length: 20 })
  type: 'opportunities' | 'rfq';

  @Column({ type: 'varchar', length: 100, unique: true })
  reference: string;

  @Column({ type: 'varchar', length: 2000 })
  description: string;

  @Column({ type: 'datetime' })
  bidOpeningDate: Date;

  @Column({ type: 'nvarchar', length: 20 })
  status: 'open' | 'closed';

  @Column({ type: 'varchar', length: 2000 })
  noticeUrl: string;

  @Column({ type: 'varchar', length: 500 })
  noticeFileName: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  category: 'Consultancy' | 'Non-Consultancy' | 'Goods' | 'Works' | null;

  @Column({ default: false })
  published: boolean;

  @Column({ type: 'datetime', nullable: true })
  publishedAt: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  createdBy: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('procurement_awards')
@Index(['procurementReference'], { unique: true })
@Index(['type'])
@Index(['published'])
@Index(['dateAwarded'])
@Index(['createdAt'])
@Index(['publishedAt'])
export class ProcurementAward {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'nvarchar', length: 20 })
  type: 'opportunities' | 'rfq';

  @Column({ type: 'varchar', length: 100, unique: true })
  procurementReference: string;

  @Column({ type: 'varchar', length: 2000 })
  description: string;

  @Column('simple-json')
  executiveSummary: { title: string; url: string; fileName: string };

  @Column({ type: 'varchar', length: 500 })
  successfulBidder: string;

  @Column({ type: 'datetime' })
  dateAwarded: Date;

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


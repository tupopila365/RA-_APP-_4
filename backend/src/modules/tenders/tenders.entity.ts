import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('tenders')
@Index(['referenceNumber'], { unique: true })
@Index(['status'])
@Index(['category'])
@Index(['published'])
@Index(['closingDate'])
@Index(['openingDate'])
@Index(['createdAt'])
export class Tender {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  referenceNumber: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column('nvarchar', { length: 'MAX' })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column('float', { nullable: true })
  value: number | null;

  @Column({ type: 'nvarchar', length: 20 })
  status: 'open' | 'closed' | 'upcoming';

  @Column({ type: 'datetime' })
  openingDate: Date;

  @Column({ type: 'datetime' })
  closingDate: Date;

  @Column({ type: 'varchar', length: 2000 })
  pdfUrl: string;

  @Column({ default: false })
  published: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


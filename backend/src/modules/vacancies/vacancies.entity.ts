import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('vacancies')
@Index(['type'])
@Index(['department'])
@Index(['location'])
@Index(['published'])
@Index(['closingDate'])
@Index(['createdAt'])
export class Vacancy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'nvarchar', length: 50 })
  type: 'full-time' | 'part-time' | 'bursary' | 'internship';

  @Column({ type: 'varchar', length: 200 })
  department: string;

  @Column({ type: 'varchar', length: 200 })
  location: string;

  @Column('nvarchar', { length: 'MAX' })
  description: string;

  @Column('simple-json')
  requirements: string[];

  @Column('simple-json')
  responsibilities: string[];

  @Column({ type: 'varchar', length: 100, nullable: true })
  salary: string | null;

  @Column({ type: 'datetime' })
  closingDate: Date;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  pdfUrl: string | null;

  @Column({ default: false })
  published: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  contactName: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactEmail: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  contactTelephone: string | null;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  submissionLink: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  submissionEmail: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  submissionInstructions: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


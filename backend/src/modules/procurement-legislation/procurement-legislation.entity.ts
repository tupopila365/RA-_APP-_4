import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('procurement_legislations')
@Index(['section'])
@Index(['published'])
@Index(['createdAt'])
@Index(['publishedAt'])
export class ProcurementLegislation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'nvarchar', length: 20 })
  section: 'act' | 'regulations' | 'guidelines';

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'varchar', length: 2000 })
  documentUrl: string;

  @Column({ type: 'varchar', length: 500 })
  documentFileName: string;

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


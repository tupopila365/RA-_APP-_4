import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type RAServiceCategory =
  | 'Licensing'
  | 'Vehicle Registration'
  | 'Permits & Authorisations'
  | 'Other';

export interface RAServicePdf {
  title: string;
  url: string;
  fileName: string;
}

@Entity('ra_services')
@Index(['category'])
@Index(['published'])
@Index(['sortOrder'])
@Index(['createdAt'])
export class RAService {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'nvarchar', length: 255 })
  name: string;

  @Column({ type: 'nvarchar', length: 2000 })
  description: string;

  @Column('simple-json')
  requirements: string[];

  @Column({ type: 'nvarchar', length: 100 })
  fee: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  ageRestriction: string | null;

  @Column({ type: 'nvarchar', length: 100 })
  category: RAServiceCategory;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  imageUrl: string | null;

  @Column('simple-json')
  pdfs: RAServicePdf[];

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  contactInfo: string | null;

  @Column({ default: false })
  published: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

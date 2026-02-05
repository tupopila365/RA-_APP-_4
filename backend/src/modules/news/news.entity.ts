import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('news')
@Index(['category'])
@Index(['published'])
@Index(['publishedAt'])
@Index(['createdAt'])
export class News {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column('nvarchar', { length: 'MAX' })
  content: string;

  @Column({ type: 'varchar', length: 500 })
  excerpt: string;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'varchar', length: 200 })
  author: string;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  imageUrl: string | null;

  @Column({ default: false })
  published: boolean;

  @Column({ type: 'datetime', nullable: true })
  publishedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


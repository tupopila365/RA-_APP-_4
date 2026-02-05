import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('file_storage')
export class FileStorage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  filename: string;

  @Column({ type: 'varchar', length: 100 })
  mimeType: string;

  @Column('int')
  size: number;

  @Column({ type: 'varbinary', length: 'max' })
  data: Buffer;

  @CreateDateColumn()
  createdAt: Date;
}

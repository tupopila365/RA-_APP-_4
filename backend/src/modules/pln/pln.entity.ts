import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('plns')
@Index(['referenceId'], { unique: true })
@Index(['status', 'createdAt'])
@Index(['createdAt'])
@Index(['assignedTo'])
@Index(['priority'])
@Index(['surname'])
@Index(['businessName'])
@Index(['email'])
export class PLN {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  referenceId: string;

  @Column({ type: 'varchar', length: 50, default: '12345' })
  trackingPin: string;

  @Column({ type: 'varchar', length: 100, default: 'New Personalised Licence Number' })
  transactionType: string;

  @Column({ type: 'nvarchar', length: 50 })
  idType: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  trafficRegisterNumber: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  businessRegNumber: string | null;

  @Column({ type: 'varchar', length: 100 })
  surname: string;

  @Column({ type: 'varchar', length: 10 })
  initials: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  businessName: string | null;

  @Column('simple-json')
  postalAddress: { line1: string; line2?: string; line3?: string };

  @Column('simple-json')
  streetAddress: { line1: string; line2?: string; line3?: string };

  @Column('simple-json', { nullable: true })
  telephoneHome: { code: string; number: string } | null;

  @Column('simple-json', { nullable: true })
  telephoneDay: { code: string; number: string } | null;

  @Column('simple-json', { nullable: true })
  cellNumber: { code: string; number: string } | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  trafficRegisterNumber_encrypted: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  businessRegNumber_encrypted: string | null;

  @Column({ type: 'varchar', length: 500 })
  surname_encrypted: string;

  @Column({ type: 'varchar', length: 500 })
  initials_encrypted: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  businessName_encrypted: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  email_encrypted: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  trafficRegisterNumber_hash: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  businessRegNumber_hash: string | null;

  @Column({ type: 'varchar', length: 100 })
  surname_hash: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email_hash: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  fullName: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  idNumber: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phoneNumber: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  fullName_encrypted: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  idNumber_encrypted: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  phoneNumber_encrypted: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  fullName_hash: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  idNumber_hash: string | null;

  @Column({ type: 'nvarchar', length: 30 })
  plateFormat: string;

  @Column('int')
  quantity: 1 | 2;

  @Column('simple-json')
  plateChoices: Array<{ text: string; meaning: string }>;

  @Column({ default: false })
  hasRepresentative: boolean;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  representativeIdType: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  representativeIdNumber: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  representativeSurname: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  representativeInitials: string | null;

  @Column({ default: false })
  hasVehicle: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  currentLicenceNumber: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  vehicleRegisterNumber: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  chassisNumber: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  vehicleMake: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  seriesName: string | null;

  @Column({ default: false })
  declarationAccepted: boolean;

  @Column({ type: 'datetime' })
  declarationDate: Date;

  @Column({ type: 'varchar', length: 100 })
  declarationPlace: string;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  declarationRole: string | null;

  @Column({ type: 'varchar', length: 2000 })
  documentUrl: string;

  @Column({ type: 'nvarchar', length: 30, default: 'SUBMITTED' })
  status: string;

  @Column('simple-json', { default: '[]' })
  statusHistory: Array<{ status: string; changedBy: string; timestamp: Date; comment?: string }>;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  adminComments: string | null;

  @Column({ type: 'datetime', nullable: true })
  paymentDeadline: Date | null;

  @Column({ type: 'datetime', nullable: true })
  paymentReceivedAt: Date | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  assignedTo: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'NORMAL' })
  priority: string;

  @Column('simple-json', { nullable: true })
  tags: string[] | null;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  internalNotes: string | null;

  @Column('float', { nullable: true })
  paymentAmount: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentMethod: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentReference: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  processedBy: string | null;

  @Column({ type: 'datetime', nullable: true })
  processedAt: Date | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  reviewedBy: string | null;

  @Column({ type: 'datetime', nullable: true })
  reviewedAt: Date | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  plateOrderNumber: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  plateSupplier: string | null;

  @Column({ type: 'datetime', nullable: true })
  plateOrderedAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  plateDeliveredAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  plateCollectedAt: Date | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  plateCollectedBy: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


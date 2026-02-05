import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('vehicle_regs')
@Index(['referenceId'], { unique: true })
@Index(['status', 'createdAt'])
@Index(['createdAt'])
@Index(['assignedTo'])
@Index(['priority'])
@Index(['surname'])
@Index(['businessName'])
@Index(['make'])
@Index(['chassisNumber'])
export class VehicleReg {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  referenceId: string;

  @Column({ type: 'varchar', length: 50, default: '12345' })
  trackingPin: string;

  @Column({ type: 'nvarchar', length: 50 })
  idType: string;

  @Column({ type: 'varchar', length: 200 })
  identificationNumber: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  personType: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  surname: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  initials: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  businessName: string | null;

  @Column('simple-json')
  postalAddress: { line1: string; line2?: string; line3?: string };

  @Column('simple-json')
  streetAddress: { line1: string; line2?: string; line3?: string };

  @Column('simple-json', { nullable: true })
  telephoneDay: { code: string; number: string } | null;

  @Column({ default: false })
  hasProxy: boolean;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  proxyIdType: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  proxyIdNumber: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  proxySurname: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  proxyInitials: string | null;

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
  declarationAccepted: boolean;

  @Column({ type: 'datetime' })
  declarationDate: Date;

  @Column({ type: 'varchar', length: 100 })
  declarationPlace: string;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  declarationRole: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  declarationSignature: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  registrationNumber: string | null;

  @Column({ type: 'varchar', length: 100 })
  make: string;

  @Column({ type: 'varchar', length: 200 })
  seriesName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  vehicleCategory: string | null;

  @Column({ type: 'nvarchar', length: 50 })
  drivenType: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  vehicleDescription: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  netPower: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  engineCapacity: string | null;

  @Column({ type: 'nvarchar', length: 20 })
  fuelType: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  fuelTypeOther: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  totalMass: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  grossVehicleMass: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  maxPermissibleVehicleMass: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  maxPermissibleDrawingMass: string | null;

  @Column({ type: 'nvarchar', length: 20 })
  transmission: string;

  @Column({ type: 'nvarchar', length: 20 })
  mainColour: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  mainColourOther: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  usedForTransportation: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  economicSector: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  odometerReading: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  odometerReadingKm: string | null;

  @Column('simple-json', { nullable: true })
  vehicleStreetAddress: { line1: string; line2?: string; line3?: string } | null;

  @Column({ type: 'nvarchar', length: 20 })
  ownershipType: string;

  @Column({ default: true })
  usedOnPublicRoad: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  chassisNumber: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  engineNumber: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  feesPaidRegistration: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  receiptNumberRegistration: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  feesPaidLicensing: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  receiptNumberLicensing: string | null;

  @Column({ type: 'bit', nullable: true })
  roadWorthinessCompliant: boolean | null;

  @Column({ type: 'datetime', nullable: true })
  roadWorthinessTestDate: Date | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  roadWorthinessCertificateNumber: string | null;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  registrationReason: string | null;

  @Column({ type: 'bit', nullable: true })
  policeClearanceSubmitted: boolean | null;

  @Column({ type: 'datetime', nullable: true })
  transactionEffectiveDate: Date | null;

  @Column({ type: 'datetime', nullable: true })
  firstLicensingLiabilityDate: Date | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  registrationCertificateControlNumber: string | null;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  vehicleStatus: string | null;

  @Column({ type: 'varchar', length: 2000 })
  documentUrl: string;

  @Column({ type: 'nvarchar', length: 20, default: 'SUBMITTED' })
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

  @Column({ type: 'varchar', length: 20, nullable: true })
  registrationNumberAssigned: string | null;

  @Column({ type: 'datetime', nullable: true })
  registrationDate: Date | null;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  registrationCertificateUrl: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


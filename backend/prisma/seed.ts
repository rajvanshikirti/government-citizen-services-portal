import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const services = [
  {
    name: 'Birth Certificate',
    slug: 'birth-certificate',
    description: 'Apply for a new birth certificate or obtain a duplicate copy.',
    category: 'Vital Records',
    processingDays: 5,
    fee: 50,
    requiredDocs: ['Proof of Birth', 'Parent ID Proof', 'Address Proof'],
  },
  {
    name: 'Death Certificate',
    slug: 'death-certificate',
    description: 'Register a death and obtain an official death certificate.',
    category: 'Vital Records',
    processingDays: 3,
    fee: 30,
    requiredDocs: ['Medical Certificate', 'ID Proof of Deceased', 'Applicant ID Proof'],
  },
  {
    name: 'Income Certificate',
    slug: 'income-certificate',
    description: 'Obtain an income certificate for scholarships, subsidies, and benefits.',
    category: 'Certificates',
    processingDays: 7,
    fee: 20,
    requiredDocs: ['Salary Slip', 'ITR', 'Address Proof', 'ID Proof'],
  },
  {
    name: 'Caste Certificate',
    slug: 'caste-certificate',
    description: 'Apply for caste certificate for reservation and welfare schemes.',
    category: 'Certificates',
    processingDays: 10,
    fee: 25,
    requiredDocs: ['School Certificate', 'Parent Caste Certificate', 'Address Proof'],
  },
  {
    name: 'Property Tax',
    slug: 'property-tax',
    description: 'Pay property tax and obtain tax receipts online.',
    category: 'Revenue',
    processingDays: 2,
    fee: 0,
    requiredDocs: ['Property Documents', 'Previous Tax Receipt', 'ID Proof'],
  },
  {
    name: 'Water Connection',
    slug: 'water-connection',
    description: 'Apply for new water connection or transfer existing connection.',
    category: 'Utilities',
    processingDays: 14,
    fee: 500,
    requiredDocs: ['Property Ownership Proof', 'ID Proof', 'NOC from Society'],
  },
  {
    name: 'Electricity Connection',
    slug: 'electricity-connection',
    description: 'Apply for new electricity connection or load enhancement.',
    category: 'Utilities',
    processingDays: 10,
    fee: 750,
    requiredDocs: ['Property Documents', 'ID Proof', 'Load Sanction Letter'],
  },
  {
    name: 'Driving Licence Renewal',
    slug: 'driving-licence-renewal',
    description: 'Renew your driving licence before expiry.',
    category: 'Transport',
    processingDays: 5,
    fee: 200,
    requiredDocs: ['Existing Driving Licence', 'Medical Certificate', 'Passport Photo'],
  },
];

async function main() {
  const passwordHash = await bcrypt.hash('Password@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@govportal.gov' },
    update: {},
    create: {
      email: 'admin@govportal.gov',
      password: passwordHash,
      firstName: 'System',
      lastName: 'Admin',
      phone: '9999999999',
      role: 'ADMIN',
    },
  });

  const officer = await prisma.user.upsert({
    where: { email: 'officer@govportal.gov' },
    update: {},
    create: {
      email: 'officer@govportal.gov',
      password: passwordHash,
      firstName: 'Rajesh',
      lastName: 'Kumar',
      phone: '8888888888',
      role: 'OFFICER',
    },
  });

  const citizen = await prisma.user.upsert({
    where: { email: 'citizen@example.com' },
    update: {},
    create: {
      email: 'citizen@example.com',
      password: passwordHash,
      firstName: 'Amit',
      lastName: 'Sharma',
      phone: '7777777777',
      aadhaarNumber: '234567890124',
      address: '123 MG Road',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      role: 'CITIZEN',
    },
  });

  for (const service of services) {
    await prisma.governmentService.upsert({
      where: { slug: service.slug },
      update: service,
      create: service,
    });
  }

  console.log('Seed completed:', { admin: admin.email, officer: officer.email, citizen: citizen.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

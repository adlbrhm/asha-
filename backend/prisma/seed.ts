import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data in reverse order of dependencies
  await prisma.followUp.deleteMany();
  await prisma.screening.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();
  await prisma.pHC.deleteMany();

  // Hash password for all accounts
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash('password123', saltRounds);

  // 1. Create Bantwal PHC
  const bantwalPhc = await prisma.pHC.create({
    data: {
      name: 'Bantwal PHC',
      district: 'Dakshina Kannada',
      state: 'Karnataka',
      active: true,
    },
  });

  // 2. Create Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@asha.demo',
      name: 'Admin User',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  const doctor = await prisma.user.create({
    data: {
      email: 'doctor@asha.demo',
      name: 'Dr. Rao',
      passwordHash,
      role: 'DOCTOR',
      phcId: bantwalPhc.id,
      status: 'ACTIVE',
    },
  });

  const asha1 = await prisma.user.create({
    data: {
      email: 'asha@asha.demo',
      name: 'ASHA Meena',
      passwordHash,
      role: 'ASHA',
      village: 'Kalladka',
      phcId: bantwalPhc.id,
      status: 'ACTIVE',
    },
  });

  const asha2 = await prisma.user.create({
    data: {
      email: 'asha2@asha.demo',
      name: 'ASHA Sita',
      passwordHash,
      role: 'ASHA',
      village: 'Bantwal',
      phcId: bantwalPhc.id,
      status: 'ACTIVE',
    },
  });

  const asha3 = await prisma.user.create({
    data: {
      email: 'asha3@asha.demo',
      name: 'ASHA Anita',
      passwordHash,
      role: 'ASHA',
      village: 'Vitla',
      phcId: bantwalPhc.id,
      status: 'ACTIVE',
    },
  });

  console.log('PHCs and Users seeded successfully.');

  // 3. Create 10 Patients
  const patientData = [
    { name: 'Ramesh Kumar', age: 52, gender: 'Male', phone: '9876543210', village: 'Kalladka', houseNumber: '42' },
    { name: 'Lakshmi Bai', age: 70, gender: 'Female', phone: '9876543211', village: 'Bantwal', houseNumber: '15' },
    { name: 'Suresh Gowda', age: 60, gender: 'Male', phone: '9876543212', village: 'Vitla', houseNumber: '8B' },
    { name: 'Sunita Devi', age: 48, gender: 'Female', phone: '9876543213', village: 'Mani', houseNumber: '104' },
    { name: 'Rajesh Shetty', age: 38, gender: 'Male', phone: '9876543214', village: 'Puttur', houseNumber: '29' },
    { name: 'Kamala Bhatt', age: 65, gender: 'Female', phone: '9876543215', village: 'Kalladka', houseNumber: '53' },
    { name: 'Anil Poojary', age: 44, gender: 'Male', phone: '9876543216', village: 'Bantwal', houseNumber: '3' },
    { name: 'Mary Dsouza', age: 58, gender: 'Female', phone: '9876543217', village: 'Vitla', houseNumber: '91' },
    { name: 'Nagaraj Bhat', age: 63, gender: 'Male', phone: '9876543218', village: 'Mani', houseNumber: '76' },
    { name: 'Radha Nayak', age: 50, gender: 'Female', phone: '9876543219', village: 'Puttur', houseNumber: '12' },
  ];

  const patients = [];
  for (const data of patientData) {
    const patient = await prisma.patient.create({ data });
    patients.push(patient);
  }
  console.log('10 Patients seeded.');

  // 4. Create 10 Screenings
  // Risk Levels: 3 RED, 4 YELLOW, 3 GREEN
  const ashList = [asha1, asha2, asha3];
  
  const screeningsList = [
    // RED: 3
    {
      patientIndex: 0,
      bpSystolic: 168,
      bpDiastolic: 102,
      sugar: 238,
      familyHistory: true,
      lowActivity: true,
      tobaccoUse: false,
      symptoms: 'Dizziness',
      riskLevel: 'RED',
      riskReasons: ['Severe Hypertension', 'Elevated Blood Sugar'],
    },
    {
      patientIndex: 1,
      bpSystolic: 182,
      bpDiastolic: 110,
      sugar: 195,
      familyHistory: false,
      lowActivity: true,
      tobaccoUse: true,
      symptoms: 'Headache, Blurred Vision',
      riskLevel: 'RED',
      riskReasons: ['Severe Hypertension', 'Tobacco Use'],
    },
    {
      patientIndex: 5,
      bpSystolic: 140,
      bpDiastolic: 90,
      sugar: 310,
      familyHistory: true,
      lowActivity: false,
      tobaccoUse: false,
      symptoms: 'Frequent Urination, Thirst',
      riskLevel: 'RED',
      riskReasons: ['Severe Hyperglycemia'],
    },
    // YELLOW: 4
    {
      patientIndex: 2,
      bpSystolic: 135,
      bpDiastolic: 88,
      sugar: 150,
      familyHistory: true,
      lowActivity: false,
      tobaccoUse: false,
      symptoms: 'Mild Fatigue',
      riskLevel: 'YELLOW',
      riskReasons: ['Pre-hypertension', 'Pre-diabetes'],
    },
    {
      patientIndex: 3,
      bpSystolic: 125,
      bpDiastolic: 82,
      sugar: 165,
      familyHistory: false,
      lowActivity: true,
      tobaccoUse: false,
      symptoms: 'Fatigue',
      riskLevel: 'YELLOW',
      riskReasons: ['Pre-diabetes', 'Sedentary Lifestyle'],
    },
    {
      patientIndex: 6,
      bpSystolic: 138,
      bpDiastolic: 89,
      sugar: 110,
      familyHistory: false,
      lowActivity: false,
      tobaccoUse: true,
      symptoms: 'None',
      riskLevel: 'YELLOW',
      riskReasons: ['Borderline Hypertension', 'Tobacco Use'],
    },
    {
      patientIndex: 8,
      bpSystolic: 142,
      bpDiastolic: 85,
      sugar: 130,
      familyHistory: true,
      lowActivity: true,
      tobaccoUse: false,
      symptoms: 'None',
      riskLevel: 'YELLOW',
      riskReasons: ['Pre-hypertension', 'Family History'],
    },
    // GREEN: 3
    {
      patientIndex: 4,
      bpSystolic: 118,
      bpDiastolic: 78,
      sugar: 92,
      familyHistory: false,
      lowActivity: false,
      tobaccoUse: false,
      symptoms: 'None',
      riskLevel: 'GREEN',
      riskReasons: ['Normal Vitals'],
    },
    {
      patientIndex: 7,
      bpSystolic: 120,
      bpDiastolic: 80,
      sugar: 98,
      familyHistory: false,
      lowActivity: false,
      tobaccoUse: false,
      symptoms: 'None',
      riskLevel: 'GREEN',
      riskReasons: ['Normal Vitals'],
    },
    {
      patientIndex: 9,
      bpSystolic: 115,
      bpDiastolic: 75,
      sugar: 88,
      familyHistory: false,
      lowActivity: false,
      tobaccoUse: false,
      symptoms: 'None',
      riskLevel: 'GREEN',
      riskReasons: ['Normal Vitals'],
    },
  ];

  const screenings = [];
  for (let i = 0; i < screeningsList.length; i++) {
    const s = screeningsList[i];
    const patient = patients[s.patientIndex];
    const asha = ashList[i % ashList.length];
    
    const screening = await prisma.screening.create({
      data: {
        patientId: patient.id,
        ashaId: asha.id,
        phcId: bantwalPhc.id,
        bpSystolic: s.bpSystolic,
        bpDiastolic: s.bpDiastolic,
        sugar: s.sugar,
        familyHistory: s.familyHistory,
        lowActivity: s.lowActivity,
        tobaccoUse: s.tobaccoUse,
        symptoms: s.symptoms,
        riskLevel: s.riskLevel,
        riskReasons: JSON.stringify(s.riskReasons),
        consentGiven: true,
        status: 'NEW',
      },
    });
    screenings.push(screening);
  }
  console.log('10 Screenings seeded.');

  // 5. Create 2 Follow-ups
  const followUp1 = await prisma.followUp.create({
    data: {
      screeningId: screenings[0].id,
      patientId: screenings[0].patientId,
      assignedToAshaId: asha1.id,
      doctorId: doctor.id,
      note: 'Ask patient to visit Bantwal PHC Tuesday morning for BP assessment.',
      status: 'PENDING',
    },
  });

  await prisma.screening.update({
    where: { id: screenings[0].id },
    data: { status: 'FOLLOW_UP' },
  });

  const followUp2 = await prisma.followUp.create({
    data: {
      screeningId: screenings[1].id,
      patientId: screenings[1].patientId,
      assignedToAshaId: asha2.id,
      doctorId: doctor.id,
      note: 'Monitor patient compliance with diabetic diet and medication.',
      status: 'PENDING',
    },
  });

  await prisma.screening.update({
    where: { id: screenings[1].id },
    data: { status: 'FOLLOW_UP' },
  });

  console.log('2 Follow-ups seeded.');
  console.log('Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

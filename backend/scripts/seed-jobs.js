require('dotenv').config();

const mongoose = require('mongoose');

const demoJobs = [
  {
    title: 'Full Stack Developer',
    company: 'Razorpay',
    location: 'Bengaluru, Karnataka',
    salary: '₹12 - 18 LPA',
    jobType: 'Full-time',
    description:
      'Build reliable payment experiences across our merchant dashboard and high-throughput services.',
    skills: ['Angular', 'Node.js', 'MongoDB', 'REST APIs'],
    urgencyTag: 'Actively Hiring',
  },
  {
    title: 'Senior Frontend Engineer',
    company: 'Flipkart',
    location: 'Bengaluru, Karnataka',
    salary: '₹18 - 28 LPA',
    jobType: 'Hybrid',
    description:
      'Create fast, accessible shopping experiences used by millions of customers across India.',
    skills: ['Angular', 'TypeScript', 'RxJS', 'Web Performance'],
    urgencyTag: 'Actively Hiring',
  },
  {
    title: 'Backend Engineer',
    company: 'Swiggy',
    location: 'Bengaluru, Karnataka',
    salary: '₹16 - 24 LPA',
    jobType: 'Full-time',
    description:
      'Design scalable APIs and event-driven services for real-time food delivery operations.',
    skills: ['NestJS', 'Node.js', 'PostgreSQL', 'Kafka'],
  },
  {
    title: 'Product Designer (UI/UX)',
    company: 'PhonePe',
    location: 'Pune, Maharashtra',
    salary: '₹14 - 22 LPA',
    jobType: 'Hybrid',
    description:
      'Shape intuitive payment journeys through research, prototyping, and thoughtful visual design.',
    skills: ['Figma', 'Design Systems', 'Prototyping', 'User Research'],
    urgencyTag: 'Urgent Opening',
  },
  {
    title: 'DevOps Engineer',
    company: 'Freshworks',
    location: 'Chennai, Tamil Nadu',
    salary: '₹15 - 23 LPA',
    jobType: 'Full-time',
    description:
      'Improve deployment reliability and observability for cloud-native customer support products.',
    skills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD'],
    urgencyTag: 'Actively Hiring',
  },
  {
    title: 'AI Engineer',
    company: 'Sarvam AI',
    location: 'Bengaluru, Karnataka',
    salary: '₹20 - 32 LPA',
    jobType: 'Hybrid',
    description:
      'Build and evaluate generative AI systems for multilingual products and practical workflows.',
    skills: ['Python', 'LLMs', 'PyTorch', 'Machine Learning'],
    urgencyTag: 'Urgent Opening',
  },
  {
    title: 'Frontend Developer',
    company: 'CRED',
    location: 'Bengaluru, Karnataka',
    salary: '₹12 - 20 LPA',
    jobType: 'Remote',
    description:
      'Deliver polished member-facing web experiences with a focus on quality and interaction detail.',
    skills: ['React', 'TypeScript', 'CSS', 'Accessibility'],
  },
  {
    title: 'Platform Backend Developer',
    company: 'Meesho',
    location: 'Bengaluru, Karnataka',
    salary: '₹14 - 22 LPA',
    jobType: 'Remote',
    description:
      'Develop dependable services that help sellers manage catalogues, orders, and fulfilment.',
    skills: ['Java', 'Microservices', 'Redis', 'MySQL'],
    urgencyTag: 'Actively Hiring',
  },
  {
    title: 'UI/UX Designer',
    company: 'Zomato',
    location: 'Gurugram, Haryana',
    salary: '₹10 - 16 LPA',
    jobType: 'Full-time',
    description:
      'Turn customer insights into clear, engaging experiences across discovery and dining products.',
    skills: ['Figma', 'UI Design', 'Interaction Design', 'Prototyping'],
  },
  {
    title: 'Cloud Infrastructure Engineer',
    company: 'Airtel Digital',
    location: 'Gurugram, Haryana',
    salary: '₹16 - 25 LPA',
    jobType: 'Hybrid',
    description:
      'Automate resilient cloud infrastructure supporting digital services at national scale.',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Monitoring'],
    urgencyTag: 'Urgent Opening',
  },
  {
    title: 'Machine Learning Engineer',
    company: 'Tata 1mg',
    location: 'Gurugram, Haryana',
    salary: '₹18 - 28 LPA',
    jobType: 'Remote',
    description:
      'Apply machine learning to improve healthcare discovery and personalized recommendations.',
    skills: ['Python', 'TensorFlow', 'NLP', 'ML Pipelines'],
    urgencyTag: 'Actively Hiring',
  },
];

async function seedJobs() {
  const connection = await mongoose
    .createConnection(
      process.env.MONGODB_URI ??
        'mongodb://127.0.0.1:27017/job_portal',
    )
    .asPromise();

  try {
    const recruiter = await connection
      .collection('users')
      .findOne({ role: 'recruiter' }, { projection: { _id: 1 } });

    if (!recruiter) {
      throw new Error(
        'Register or create a recruiter account before seeding demo jobs.',
      );
    }

    const jobsCollection = connection.collection('jobs');
    const operations = demoJobs.map((job) => ({
      updateOne: {
        filter: {
          title: job.title,
          company: job.company,
          recruiterId: recruiter._id.toString(),
        },
        update: {
          $setOnInsert: {
            ...job,
            recruiterId: recruiter._id.toString(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        upsert: true,
      },
    }));

    const result = await jobsCollection.bulkWrite(operations);
    console.log(
      `Demo job seed complete: ${result.upsertedCount} inserted, ${result.matchedCount} already present.`,
    );
  } finally {
    await connection.close();
  }
}

seedJobs().catch((error) => {
  console.error('Unable to seed demo jobs:', error.message);
  process.exitCode = 1;
});

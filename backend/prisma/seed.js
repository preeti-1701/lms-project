import prisma from "../src/config/db.js";

async function main() {
  console.log("🌱 Seeding started...");

  const userId = "54440fb4-dcb9-4403-a740-5b24a59ca313"; // 🔥 your admin/trainer ID

  const coursesData = [
    {
      title: "DBMS Fundamentals",
      videos: [
        "https://www.youtube.com/watch?v=HXV3zeQKqGY",
        "https://www.youtube.com/watch?v=ztHopE5Wnpc",
        "https://www.youtube.com/watch?v=4Z9KEBexzcM",
      ],
    },
    {
      title: "SQL Mastery",
      videos: [
        "https://www.youtube.com/watch?v=7S_tz1z_5bA",
        "https://www.youtube.com/watch?v=HXV3zeQKqGY",
        "https://www.youtube.com/watch?v=9Pzj7Aj25lw",
      ],
    },
    {
      title: "React JS Complete Guide",
      videos: [
        "https://www.youtube.com/watch?v=bMknfKXIFA8",
        "https://www.youtube.com/watch?v=w7ejDZ8SWv8",
        "https://www.youtube.com/watch?v=SqcY0GlETPk",
      ],
    },
    {
      title: "Node.js Backend Development",
      videos: [
        "https://www.youtube.com/watch?v=Oe421EPjeBE",
        "https://www.youtube.com/watch?v=fBNz5xF-Kx4",
        "https://www.youtube.com/watch?v=TlB_eWDSMt4",
      ],
    },
    {
      title: "Python Programming",
      videos: [
        "https://www.youtube.com/watch?v=_uQrJ0TkZlc",
        "https://www.youtube.com/watch?v=kqtD5dpn9C8",
        "https://www.youtube.com/watch?v=rfscVS0vtbw",
      ],
    },
    {
      title: "Java Programming",
      videos: [
        "https://www.youtube.com/watch?v=eIrMbAQSU34",
        "https://www.youtube.com/watch?v=grEKMHGYyns",
        "https://www.youtube.com/watch?v=UmnCZ7-9yDY",
      ],
    },
    {
      title: "Flutter App Development",
      videos: [
        "https://www.youtube.com/watch?v=VPvVD8t02U8",
        "https://www.youtube.com/watch?v=1gDhl4leEzA",
        "https://www.youtube.com/watch?v=x0uinJvhNxI",
      ],
    },
    {
      title: "DevOps Fundamentals",
      videos: [
        "https://www.youtube.com/watch?v=0yWAtQ6wYNM",
        "https://www.youtube.com/watch?v=j5Zsa_eOXeY",
        "https://www.youtube.com/watch?v=9pZ2xmsSDdo",
      ],
    },
    {
      title: "Docker & Containers",
      videos: [
        "https://www.youtube.com/watch?v=fqMOX6JJhGo",
        "https://www.youtube.com/watch?v=3c-iBn73dDE",
        "https://www.youtube.com/watch?v=Gjnup-PuquQ",
      ],
    },
    {
      title: "Kubernetes Basics",
      videos: [
        "https://www.youtube.com/watch?v=X48VuDVv0do",
        "https://www.youtube.com/watch?v=PH-2FfFD2PU",
        "https://www.youtube.com/watch?v=s_o8dwzRlu4",
      ],
    },
    {
      title: "AWS Cloud Essentials",
      videos: [
        "https://www.youtube.com/watch?v=ulprqHHWlng",
        "https://www.youtube.com/watch?v=Ia-UEYYR44s",
        "https://www.youtube.com/watch?v=3hLmDS179YE",
      ],
    },
    {
      title: "Machine Learning Basics",
      videos: [
        "https://www.youtube.com/watch?v=GwIo3gDZCVQ",
        "https://www.youtube.com/watch?v=ukzFI9rgwfU",
        "https://www.youtube.com/watch?v=Gv9_4yMHFhI",
      ],
    },
    {
      title: "Data Structures & Algorithms",
      videos: [
        "https://www.youtube.com/watch?v=8hly31xKli0",
        "https://www.youtube.com/watch?v=RBSGKlAvoiM",
        "https://www.youtube.com/watch?v=B31LgI4Y4DQ",
      ],
    },
    {
      title: "Cyber Security Basics",
      videos: [
        "https://www.youtube.com/watch?v=inWWhr5tnEA",
        "https://www.youtube.com/watch?v=3Kq1MIfTWCE",
        "https://www.youtube.com/watch?v=U_P23SqJaDc",
      ],
    },
    {
      title: "Operating Systems",
      videos: [
        "https://www.youtube.com/watch?v=26QPDBe-NB8",
        "https://www.youtube.com/watch?v=vBURTt97EkA",
        "https://www.youtube.com/watch?v=F18RiREDkwE",
      ],
    },
    {
      title: "Computer Networks",
      videos: [
        "https://www.youtube.com/watch?v=qiQR5rTSshw",
        "https://www.youtube.com/watch?v=3QhU9jd03a0",
        "https://www.youtube.com/watch?v=9mVn0hC1dZk",
      ],
    },
    {
      title: "HTML & CSS Basics",
      videos: [
        "https://www.youtube.com/watch?v=mU6anWqZJcc",
        "https://www.youtube.com/watch?v=UB1O30fR-EE",
        "https://www.youtube.com/watch?v=yfoY53QXEnI",
      ],
    },
    {
      title: "JavaScript Complete Course",
      videos: [
        "https://www.youtube.com/watch?v=W6NZfCO5SIk",
        "https://www.youtube.com/watch?v=PkZNo7MFNFg",
        "https://www.youtube.com/watch?v=upDLs1sn7g4",
      ],
    },
    {
      title: "Git & GitHub",
      videos: [
        "https://www.youtube.com/watch?v=RGOj5yH7evk",
        "https://www.youtube.com/watch?v=SWYqp7iY_Tc",
        "https://www.youtube.com/watch?v=HVsySz-h9r4",
      ],
    },
    {
      title: "Linux Fundamentals",
      videos: [
        "https://www.youtube.com/watch?v=IVquJh3DXUA",
        "https://www.youtube.com/watch?v=ZtqBQ68cfJc",
        "https://www.youtube.com/watch?v=rrB13utjYV4",
      ],
    },
  ];

  for (const course of coursesData) {
    await prisma.course.create({
      data: {
        title: course.title,
        createdBy: userId,
        videos: {
          create: course.videos.map((url) => ({
            youtubeUrl: url,
          })),
        },
      },
    });
  }

  console.log("✅ Seeding completed with real data!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());

import { connectDB, getDB } from "../config/db.js";

const oldTitles = [
  "Community Tree Plantation",
  "Winter Clothes Donation",
  "Community Blood Donation",
  "Clean Our Community",
  "Free Education Workshop",
  "Food Distribution Program",
  "Public Health Awareness",
  "Volunteer Meetup 2027",
];

const newEvents = [
  {
    title: "Free Coding Bootcamp",
    description: "Join our beginner-friendly coding workshop and learn web development with experienced mentors.",
    location: "Savar, Dhaka",
    eventDate: "2027-01-20T10:00:00.000Z",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
    category: "Technology",
  },
  {
    title: "Youth Career Development",
    description: "Explore career opportunities, CV writing techniques and interview preparation.",
    location: "Dhanmondi, Dhaka",
    eventDate: "2027-02-05T09:00:00.000Z",
    image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902",
    category: "Career",
  },
  {
    title: "Community Sports Festival",
    description: "Enjoy a day of football, cricket and friendly sports competitions.",
    location: "Savar, Dhaka",
    eventDate: "2027-02-15T08:00:00.000Z",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211",
    category: "Sports",
  },
  {
    title: "Animal Care Awareness",
    description: "Learn about responsible animal care and support local animal welfare initiatives.",
    location: "Uttara, Dhaka",
    eventDate: "2027-03-01T10:00:00.000Z",
    image: "https://images.unsplash.com/photo-1450778869180-41d0601e046e",
    category: "Animal Welfare",
  },
  {
    title: "Digital Literacy Workshop",
    description: "Help community members learn basic computer skills and safe internet practices.",
    location: "Mirpur, Dhaka",
    eventDate: "2027-03-10T10:00:00.000Z",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
    category: "Education",
  },
  {
    title: "Mental Wellness Awareness",
    description: "An educational community session about emotional wellbeing and healthy daily habits.",
    location: "Dhanmondi, Dhaka",
    eventDate: "2027-03-20T09:00:00.000Z",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773",
    category: "Wellness",
  },
  {
    title: "Plastic-Free Community Campaign",
    description: "Encourage sustainable habits and learn practical ways to reduce plastic waste.",
    location: "Ashulia, Dhaka",
    eventDate: "2027-04-05T08:00:00.000Z",
    image: "https://i.pinimg.com/236x/a2/91/39/a291399a4f4926f1d0eb34672274fc0a.jpg",
    category: "Environment",
  },
  {
    title: "Photography for Beginners",
    description: "Discover photography basics, composition and creative storytelling.",
    location: "Dhaka",
    eventDate: "2027-04-15T10:00:00.000Z",
    image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d",
    category: "Arts",
  },
  {
    title: "Women Entrepreneurship Meetup",
    description: "Connect with entrepreneurs and learn about starting and growing small businesses.",
    location: "Gulshan, Dhaka",
    eventDate: "2027-05-01T09:00:00.000Z",
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72",
    category: "Entrepreneurship",
  },
  {
    title: "Community Food Festival",
    description: "Celebrate local food, culture and community through a shared food festival.",
    location: "Savar, Dhaka",
    eventDate: "2027-05-15T10:00:00.000Z",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
    category: "Culture",
  },
];

async function resetEvents() {
  try {
    await connectDB();

    const db = getDB();
    const collection = db.collection("events");

    const deleted = await collection.deleteMany({
      title: { $in: oldTitles },
    });

    const eventsWithDate = newEvents.map((event) => ({
      ...event,
      createdAt: new Date(),
    }));

    const inserted = await collection.insertMany(eventsWithDate);

    console.log("Old sample events deleted:", deleted.deletedCount);
    console.log("New events created:", inserted.insertedCount);
    console.log("HelpingHands event reset completed!");
  } catch (error) {
    console.error("Event reset failed:", error);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
}

resetEvents();

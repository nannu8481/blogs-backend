const { PrismaClient } = require("@prisma/client");
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const twilio = require("twilio");
const multer = require("multer");

// Multer configuration for handling file uploads
const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage: storage });

// const { accountSid, authToken, twilioPhoneNumber } = require("./config"); // Replace with your own configuration

const prisma = new PrismaClient();
const app = express();
const PORT = 5001;

const client = twilio(
  "AC9c92e29aa91ee9faeaaeb6e6aa195f47",
  "332616caffe86e71365c9971e897c6b3"
);

app.use(cors());

app.use(express.json());

// Get all profiles
app.get("/coupons", async (req, res) => {
  const allUsers = await prisma.user.findMany({
    orderBy: {
      id: "asc", // 'asc' for ascending order, 'desc' for descending order
    },
  });

  res.json(allUsers);
});

app.post("/coupon", upload.single("screenShot"), async (req, res) => {
  try {
    const { name, mobileNumber, couponCount } = req.body;
    const screenShot = req.file ? req.file.buffer : null; // Use the file buffer as binary data

    const newCoupon = await prisma.user.create({
      data: {
        name,
        mobileNumber,
        couponCount,
        screenShot,
      },
    });

    res.json({ message: "Coupon created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/verify-coupon", async (req, res) => {
  try {
    const { id, verify, couponCount, mobileNumber, name } = req.body;

    // Check if verification is true
    if (verify) {
      // Fetch user by ID
      const user = await prisma.user.findUnique({
        where: { id: id },
      });

      // Check if the user exists
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Generate random coupon numbers
      const coupons = Array.from({ length: couponCount }, () =>
        generateRandomCoupon()
      );

      // // Send SMS to the user's mobile number
      // await client.messages.create({
      //   body: `Hello ${name}, your coupons are ready! ${coupons?.join(", ")}`, // Replace with your desired message
      //   from: "+12015286247",
      //   to: mobileNumber,
      // });

      // Update user with new coupons
      const updatedUser = await prisma.user.update({
        where: { id: id },
        data: {
          coupons: {
            set: coupons,
          },
          isVerify: true,
        },
      });

      res.json({ message: "Coupons shared successfully" });
    } else {
      res.status(400).json({ error: "Verification failed" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/coupon/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the user with the given ID exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete the user
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Coupon record deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Function to generate a random coupon number
function generateRandomCoupon() {
  const couponLength = 8;
  const couponCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let coupon = "";

  for (let i = 0; i < couponLength; i++) {
    const randomIndex = Math.floor(Math.random() * couponCharacters.length);
    coupon += couponCharacters.charAt(randomIndex);
  }

  return coupon;
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// async function main() {
//   // ... you will write your Prisma Client queries here
// }

// main()
//   .then(async () => {
//     await prisma.user.create({
//       data: {
//         name: "amrinder",
//         mobileNumber: "9988888800",
//         couponCount: "4",
//       },
//     });

//     const allUsers = await prisma.user.findMany();
//     console.dir(allUsers, { depth: null });
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
//   });

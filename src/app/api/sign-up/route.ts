import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/models/User.model";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helper/sendVerificationEmail";
export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, email, password } = await request.json();
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        {
          status: 400,
        }
      );
    }
    const existingUserByEmail = await UserModel.findOne({
      email,
      isVerified: true,
    });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    if (existingUserByEmail) {
      return Response.json(
        {
          success: false,
          message: "Email is already taken",
        },
        {
          status: 400,
        }
      );
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);
      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });
      await newUser.save();

      const emailResponse = await sendVerificationEmail(
        email,
        username,
        verifyCode
      );
      if (!emailResponse.success) {
        return Response.json(
          {
            success: false,
            message: emailResponse.message,
          },
          {
            status: 500,
          }
        );
      }
      return Response.json(
        {
          success: true,
          message:
            "User registered successfully. Please verify your email to proceed further.",
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.log("Error registering or signing in user.");
    return Response.json(
      {
        success: false,
        message: "Error registering or signing in user.",
      },
      {
        status: 500,
      }
    );
  }
}

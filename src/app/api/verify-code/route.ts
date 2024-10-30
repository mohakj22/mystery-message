import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/models/User.model";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, code } = await request.json();
    const decodedUsername = decodeURIComponent(username);
    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (!isCodeValid) {
      return Response.json(
        {
          success: false,
          message: "The verification code is incorrect.",
        },
        {
          status: 400,
        }
      );
    }

    if (!isCodeNotExpired) {
      return Response.json(
        {
          success: false,
          message: "The verification code has expired.",
        },
        {
          status: 400,
        }
      );
    }

    // If the code is valid and not expired, proceed to verify the user
    user.isVerified = true;
    const savedUser = await user.save();
    if (savedUser) {
      return Response.json(
        {
          success: true,
          message: "Account verified successfully.",
        },
        {
          status: 200,
        }
      );
    } else {
      return Response.json(
        {
          success: false,
          message: "Failed to save user verification status.",
        },
        {
          status: 500,
        }
      );
    }
  } catch (error) {
    console.log("Error verifying user", error);

    return Response.json(
      {
        success: false,
        message: "Error verifying user.",
      },
      {
        status: 500,
      }
    );
  }
}

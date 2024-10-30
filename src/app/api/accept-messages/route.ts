import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/models/User.model";
import { authOptions } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

// Function to handle updating the user
export async function POST(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!session || !user) {
    return Response.json(
      {
        success: false,
        message: "User not authenticated.",
      },
      {
        status: 401,
      }
    );
  }

  const userID = user._id;
  const { acceptMessages } = await request.json();

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userID,
      { isAcceptingMessage: acceptMessages },
      { new: true }
    );

    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "User update failed or user not found.",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "User status updated successfully.",
        updatedUser,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Failed to update user status to accept messages.", error);
    return Response.json(
      {
        success: false,
        message: "Error updating user status.",
      },
      {
        status: 500,
      }
    );
  }
}

// Function to handle fetching the user
export async function GET(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!session || !user) {
    return Response.json(
      {
        success: false,
        message: "User not authenticated.",
      },
      {
        status: 401,
      }
    );
  }

  const userID = user._id;

  try {
    const foundUser = await UserModel.findById(userID);
    if (!foundUser) {
      return Response.json(
        {
          success: false,
          message: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(
      {
        success: true,
        isAcceptingMessages: foundUser.isAcceptingMessage,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Failed to retrieve user information.", error);
    return Response.json(
      {
        success: false,
        message: "Error retrieving user information.",
      },
      {
        status: 500,
      }
    );
  }
}

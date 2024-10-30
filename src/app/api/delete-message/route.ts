import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";
import { MessageModel, User } from "@/models/User.model";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { UserModel } from "@/models/User.model";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function DELETE(request: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  console.log(session);

  const user: User = session?.user as User;

  if (!session || !session.user) {
    return NextResponse.json(
      { message: "Unauthorized access. Please log in." },
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const messageId = url.searchParams.get("messageId");
  console.log("Received Message ID in DELETE request:", messageId);

  if (!messageId || !mongoose.Types.ObjectId.isValid(messageId)) {
    return NextResponse.json(
      { message: "Invalid or missing Message ID." },
      { status: 400 }
    );
  }

  try {
    const updateResult = await UserModel.updateOne(
      { _id: user._id },
      { $pull: { messages: { _id: messageId } } }
    );

    if (updateResult.modifiedCount === 0) {
      return Response.json(
        { message: "Message not found or already deleted", success: false },
        { status: 404 }
      );
    }

    return Response.json(
      { message: "Message deleted", success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during message deletion:", error);
    return NextResponse.json(
      { message: "An error occurred while deleting the message." },
      { status: 500 }
    );
  }
}

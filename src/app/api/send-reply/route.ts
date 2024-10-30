import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/models/User.model";
import { MessageModel } from "@/models/User.model";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  await dbConnect();
  const token = await getToken({ req: request });
  if (!token) {
    return NextResponse.json(
      { message: "Unauthorized access. Please log in." },
      { status: 401 }
    );
  }

  const { replyContent, originalMessageId } = await request.json();

  if (!replyContent || !originalMessageId) {
    return NextResponse.json(
      {
        message:
          "Invalid request data. Reply content or message ID is missing.",
      },
      { status: 400 }
    );
  }

  try {
    const newMessage = await MessageModel.create({
      content: replyContent,
      sender: token?.username,
      isAnonymous: false,
      canReply: false,
    });

    if (!newMessage || !newMessage._id) {
      return NextResponse.json(
        { message: "Failed to create message. Please try again." },
        { status: 500 }
      );
    }

    const originalMessage = await MessageModel.findById(originalMessageId);
    if (!originalMessage) {
      return NextResponse.json(
        { message: "Original message not found." },
        { status: 404 }
      );
    }

    const receiver = originalMessage.sender;

    const updatedUser = await UserModel.findOneAndUpdate(
      { username: receiver },
      { $push: { messages: newMessage._id } },
      { new: true }
    );

    if (!updatedUser) {
      await MessageModel.findByIdAndDelete(newMessage._id);
      return NextResponse.json(
        {
          message:
            "Failed to update user with the new message. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Reply sent successfully.", newMessage },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "An error occurred while sending the reply.",
      },
      { status: 500 }
    );
  }
}

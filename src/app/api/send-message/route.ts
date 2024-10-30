import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/models/User.model";
import { MessageModel } from "@/models/User.model";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  await dbConnect();

  const token = await getToken({ req: request });
  const { content, isAnonymous, reciever } = await request.json();

  if (!content || !reciever) {
    return NextResponse.json(
      { message: "Content and recipient are required." },
      { status: 400 }
    );
  }

  const receivingUser = await UserModel.findOne({
    username: reciever,
    isVerified: true,
    isAcceptingMessage: true,
  });
  if (!receivingUser) {
    return NextResponse.json(
      {
        message:
          "Receiver not found! Please enter the correct username of the receiver, or may be the reciever has not yet verified the account, or may be reciever is no longer accepting the messages.",
      },
      { status: 400 }
    );
  }

  try {
    if (token) {
      const newMessage = {
        content,
        sender: token.username,
        isAnonymous,
        canReply: true,
      };

      const updateResult = await UserModel.findByIdAndUpdate(
        receivingUser._id,
        { $push: { messages: newMessage } },
        { new: true }
      );
      if (!updateResult) {
        return NextResponse.json(
          {
            message:
              "Failed to link the message to the receiver. Please try sending it again",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: "Message sent successfully.", data: newMessage },
        { status: 201 }
      );
    } else {
      const newMessage = {
        content,
        sender: null,
        isAnonymous: true,
        canReply: false,
      };

      const updateResult = await UserModel.findByIdAndUpdate(
        receivingUser._id,
        { $push: { messages: newMessage } },
        { new: true }
      );
      if (!updateResult) {
        return NextResponse.json(
          {
            message:
              "Failed to link the message to the receiver. Please try sending it again",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: "Anonymous message sent successfully.", data: newMessage },
        { status: 201 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to send message.", error },
      { status: 500 }
    );
  }
}

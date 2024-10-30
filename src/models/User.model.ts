import mongoose, { Schema, Document } from "mongoose";

// Define the Message interface
export interface Message extends Document {
  content: string;
  createdAt: Date;
  sender: string;
  isAnonymous: boolean;
  canReply: boolean;
}

// Define the Message schema
const MessageSchema: Schema<Message> = new Schema({
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  sender: {
    type: String,
  },
  isAnonymous: {
    type: Boolean,
    required: true,
    default: true,
  },
  canReply: {
    type: Boolean,
    default: false,
  },
});

// Define the User interface
export interface User extends Document {
  username: string;
  email: string;
  password: string;
  verifyCode: string;
  verifyCodeExpiry: string;
  isVerified: boolean;
  isAcceptingMessage: boolean;
  messages: Message[];
}

// Define the User schema
const UserSchema: Schema<User> = new Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
    lowercase: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please use a valid email address"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  verifyCode: {
    type: String,
    required: [true, "Verify Code is required"],
  },
  verifyCodeExpiry: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false,
  },
  isAcceptingMessage: {
    type: Boolean,
    required: true,
    default: true,
  },
  messages: [MessageSchema],
});

// Create models
const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", UserSchema);

const MessageModel =
  (mongoose.models.Message as mongoose.Model<Message>) ||
  mongoose.model<Message>("Message", MessageSchema);

// Export models individually
export { UserModel, MessageModel };

// import { Resend } from "resend";
import VerificationEmail from "../../emails/VerificationEmial";
import { ApiResponse } from "@/types/ApiResponse";
import { resend } from "@/lib/resend";
export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse>{
    try {
        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "Mystery message | Verification Code",
            react: VerificationEmail({username, otp: verifyCode})
        })
        return { success: true, message: "Verification email sent." };
    } catch (emailError) {
        console.log("Error in sending verification email.", emailError);
        return{success: false, message:"Failed to send verification email"}
    }
}

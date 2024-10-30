import { z } from "zod";
import { UserModel } from "@/models/User.model";
import dbConnect from "@/lib/dbConnect";
import { signUpSchema, usernameValidation } from "@/schemas/signUpSchema";
const UsernameQuerySchema = z.object({ username: usernameValidation });
export async function GET(request: Request) {
  // TODO : use this in all other routes
  //   if (request.method !== "GET") {
  //     return Response.json(
  //       {
  //         success: false,
  //         message: `${request.method} not allowed`,
  //       },
  //       {
  //         status: 400,
  //       }
  //     );
  //   }
  // The latest versions of nextjs have removed this request.method .
  await dbConnect();
  try {
    // username will be checked by url
    // url : localhost:300/api/check-username-unique?username=mohakj22?phone=android
    const { searchParams } = new URL(request.url);
    const queryParam = {
      username: searchParams.get("username"),
    };
    // validate with zod
    const result = UsernameQuerySchema.safeParse(queryParam);
    console.log(result);

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(", ")
              : "Invalid query parameters.",
        },
        {
          status: 400,
        }
      );
    }
    const { username } = result.data;
    const exisistingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (exisistingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: "Username already taken.",
        },
        {
          status: 400,
        }
      );
    }
    return Response.json(
      {
        success: true,
        message: "Username Available.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error checking username", error);
    return Response.json(
      {
        success: false,
        message: "Error checking username.",
      },
      {
        status: 500,
      }
    );
  }
}

import Image from "next/image";
import Link from "next/link";
import student_img from "@/public/images/3d_student.jpg";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-300">
      <div className="flex w-[900px] h-[500px] overflow-hidden rounded-2xl shadow-lg">
        {/* Left Section */}
        <div className="w-1/2 bg-white flex flex-col justify-center items-center p-8 relative">
          <h2 className="text-2xl font-semibold mb-8">Login</h2>

          <input
            type="text"
            placeholder="Username"
            className="w-full mb-4 px-4 py-2 rounded-full shadow focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full mb-2 px-4 py-2 rounded-full shadow focus:outline-none"
          />

          <div className="w-full flex justify-end mb-4">
            <a href="#" className="text-sm text-gray-500 hover:text-purple-600">
              Forgot Password?
            </a>
          </div>

          <button className="w-full bg-purple-600 text-white py-2 rounded-full hover:bg-purple-700 transition">
            Login
          </button>

          <p className="mt-4 text-sm">
            Don’t have an account?{" "}
            <Link href="/login" className="text-purple-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        {/* Right Section */}
        <div className="w-1/2 bg-purple-500 flex justify-center items-center relative">
          <Image
            src={student_img}
            alt="Student_illustration"
            width={400}
            height={400}
            priority
            className="max-h-[350px]"
          />
        </div>
      </div>
    </div>
  );
}

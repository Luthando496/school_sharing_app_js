"use client";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Book, Github } from "lucide-react";
import { useUserStore } from "@/store/store";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import student_img from "@/public/images/3d_student.jpg";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase"; // Import db as well
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore"; // Import Firestore functions

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const login = useUserStore((state) => state.login);
  const navigate = useRouter();

  useEffect(() => {
    // Check for existing auth state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Redirect to dashboard if already logged in
        navigate.push("/resources");
      }
    });
    return () => unsubscribe();
  }, []);

  // Function to create a student document if it doesn't exist
  const createStudentDocument = async (user) => {
    try {
      // Check if student document already exists
      const studentDocRef = doc(db, "students", user.uid);
      const studentDoc = await getDoc(studentDocRef);

      // If document doesn't exist, create it
      if (!studentDoc.exists()) {
        // Extract name from email (username before @)
        const username = user.email.split("@")[0];

        await setDoc(studentDocRef, {
          studentName: user.displayName?.split(" ")[0] || username,
          studentSurname: user.displayName?.split(" ")[1] || "",
          profile_image: user.photoURL || "",
          module: "", // Empty initially
          email: user.email,
          bio: "", // Empty initially
          join_date: new Date().toISOString(),
        });

        console.log("New student document created");
      }
    } catch (error) {
      console.error("Error creating student document:", error);
    }
  };

  const handleEmailLogin = async () => {
    setLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);

      // Create or update student document
      await createStudentDocument(user);

      login(user);
      toast.success("Login successful! Redirecting...");
      navigate.push("/resources");
    } catch (error) {
      console.log(error.message, "____ERROR MESSAGE");
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);

      // Create or update student document
      await createStudentDocument(user);

      login(user);
      toast.success("Login successful! Redirecting...");
      navigate.push("/resources");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setLoading(true);
    try {
      const provider = new GithubAuthProvider();
      const { user } = await signInWithPopup(auth, provider);

      // Create or update student document
      await createStudentDocument(user);

      login(user);
      toast.success("Login successful! Redirecting...");
      navigate.push("/resources");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-300">
      <Toaster />

      <div className="flex w-[900px] h-[500px] overflow-hidden rounded-2xl shadow-lg">
        {/* Left Section */}
        <div className="w-1/2 bg-white flex flex-col justify-center items-center p-8 relative">
          <h2 className="text-2xl font-semibold mb-8">Login</h2>

          <input
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="Email"
            className="w-full mb-4 px-4 py-2 rounded-full shadow focus:outline-none"
          />
          <div className="w-full relative mb-2">
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full px-4 py-2 rounded-full shadow focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="w-full flex justify-end mb-4">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-purple-600"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            onClick={handleEmailLogin}
            disabled={loading}
            className="w-full cursor-pointer bg-purple-600 text-white py-2 rounded-full hover:bg-purple-700 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="my-4 flex items-center w-full">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div className="flex gap-4 w-full">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-full hover:bg-gray-50 transition disabled:opacity-50"
            >
              Google
            </button>
            <button
              onClick={handleGitHubLogin}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-800 text-white py-2 rounded-full hover:bg-gray-900 transition disabled:opacity-50"
            >
              <Github size={20} />
              GitHub
            </button>
          </div>

          <p className="mt-4 text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="text-purple-600 hover:underline">
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

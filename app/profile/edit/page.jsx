"use client";
import { useEffect, useState } from "react";
import { User, LogOut, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/store";
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Image from "next/image";
import toast from "react-hot-toast";

export default function EditProfilePage() {
  const [formData, setFormData] = useState({
    bio: "",
    email: "",
    module: "",
    profile_image: "",
    studentName: "",
    studentSurname: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { logout } = useUserStore((state) => state);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await fetchStudentData(currentUser.uid);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchStudentData = async (uid) => {
    try {
      const studentDocRef = doc(db, "students", uid);
      const studentDoc = await getDoc(studentDocRef);
      if (studentDoc.exists()) {
        setFormData(studentDoc.data());
      } else {
        toast.error("Profile not found. Please log in again.");
        logout();
        router.push("/login");
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      toast.error("Failed to load profile data.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, "students", user.uid), formData);
        toast.success("Profile updated successfully!");
        router.push("/profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to save profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

 
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Edit Profile</h1>
        <div className="bg-white rounded-lg shadow-md p-6 md:p-10">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Profile Image Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {formData.profile_image ? (
                  <Image
                    width={112}
                    height={112}
                    src={formData.profile_image}
                    alt={`${formData.studentName} profile`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={64} className="text-gray-400" />
                )}
              </div>
              <p className="text-sm text-gray-500">
                Image is automatically updated via Google login.
              </p>
            </div>

            {/* Personal Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="studentName" className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  name="studentName"
                  id="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>
              <div>
                <label htmlFor="studentSurname" className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  name="studentSurname"
                  id="studentSurname"
                  value={formData.studentSurname}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>
            </div>

            {/* Email and Module */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border bg-gray-100 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed here.</p>
              </div>
              <div>
                <label htmlFor="module" className="block text-sm font-medium text-gray-700">Module</label>
                <input
                  type="text"
                  name="module"
                  id="module"
                  value={formData.module}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>
            </div>

            {/* Bio Section */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                id="bio"
                name="bio"
                rows="4"
                value={formData.bio}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <X size={18} className="mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
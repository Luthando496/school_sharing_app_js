"use client";
import { useEffect, useState } from "react";
// Removed unused icons: Edit, Save, X. Kept the rest.
import { User, LogOut, Book, Download, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/store";
import { auth, db } from "@/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
// Removed unused firestore/storage functions: updateDoc, ref, uploadBytes, getDownloadURL
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import Image from "next/image";

export default function ProfilePage() {
  const [student, setStudent] = useState(null);
  const [userResources, setUserResources] = useState([]);
  // Removed state related to editing: isEditing, uploadingImage, saving, formData
  const [loading, setLoading] = useState(true);
  const route = useRouter();
  const { logout } = useUserStore((state) => state);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await fetchStudentData(currentUser.uid);
        await fetchUserResources(currentUser.uid);
      } else {
        route.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [route]); // Added route to dependency array as it's used inside useEffect

  const fetchStudentData = async (uid) => {
    try {
      const studentDoc = await getDoc(doc(db, "students", uid));

      if (studentDoc.exists()) {
        setStudent({
          id: studentDoc.id,
          ...studentDoc.data(),
        });
      } else {
        // If student document doesn't exist, create a basic one
        const currentUser = auth.currentUser;
        if (currentUser) {
          const basicStudentData = {
            id: currentUser.uid,
            studentName: currentUser.displayName?.split(" ")[0] || "User",
            studentSurname: currentUser.displayName?.split(" ")[1] || "",
            profile_image: "",
            module: "Not specified",
            email: currentUser.email || "",
            bio: "No bio yet",
            join_date: new Date().toISOString(),
          };
          setStudent(basicStudentData);

          // Create the document in Firestore
          await setDoc(doc(db, "students", currentUser.uid), basicStudentData);
        }
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
    }
  };

  const fetchUserResources = async (uid) => {
    try {
      const resourcesQuery = query(
        collection(db, "student_posts"),
        where("authorId", "==", uid),
        orderBy("uploadDate", "desc")
      );
      const resourcesSnapshot = await getDocs(resourcesQuery);
      const resources = resourcesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Convert the Firestore Timestamp to a JavaScript Date object
          uploadDate: data.uploadDate.toDate().toISOString(),
        };
      });
      setUserResources(resources);
    } catch (error) {
      console.error("Error fetching user resources:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout();
      route.push("/resources");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Removed all handler functions related to editing:
  // handleInputChange, handleImageUpload, handleSaveProfile, handleCancelEdit

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header - Simplified to remove editing UI */}
      <section className="py-8 bg-gradient-to-r from-blue-500 to-indigo-600">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center overflow-hidden">
                {student?.profile_image ? (
                  <Image
                    width={452}
                    height={420}
                    src={student.profile_image}
                    alt={`${student.studentName} ${student.studentSurname}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={48} className="text-gray-400" />
                )}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              {/* Removed conditional rendering for editing */}
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {student?.studentName} {student?.studentSurname}
              </h1>
              <p className="text-blue-100">{student?.email}</p>
              <p className="text-blue-100 mt-2">{student?.bio}</p>

              <div className="mt-4">
                <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                  {student?.module}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                <div className="text-white">
                  <span className="font-bold">{userResources.length}</span>
                  <span className="text-blue-100 ml-1">Resources</span>
                </div>
                <div className="text-white">
                  <span className="font-bold">
                    {userResources.reduce(
                      (acc, resource) => acc + resource.downloads,
                      0
                    )}
                  </span>
                  <span className="text-blue-100 ml-1">Downloads</span>
                </div>
                <div className="text-white">
                  <span className="text-blue-100">Joined </span>
                  <span className="font-bold">
                    {student?.join_date
                      ? new Date(student.join_date).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {/* Removed Edit/Save/Cancel buttons, only Logout remains */}
              <button
                onClick={handleLogout}
                className="bg-white text-amber-600 cursor-pointer hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg transition duration-300 flex items-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Student Information Section - Simplified to remove editing UI */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Student Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Personal Details
              </h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Full Name:</span>{" "}
                  {student?.studentName} {student?.studentSurname}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {student?.email}
                </p>
                <p>
                  <span className="font-medium">Module:</span> {student?.module}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Bio</h3>
              <p className="text-gray-600">{student?.bio}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section to display user's uploaded resources */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            My Uploaded Resources
          </h2>
          {userResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {userResources.map((resource) => (
                <div
                  key={resource.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col"
                >
                  <Link href={`/resources/${resource.id}`}>
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      {resource.image ? (
                        <Image
                          width={452}
                          height={300}
                          src={resource.image}
                          alt={resource.title}
                          className="w-full h-full object-center"
                        />
                      ) : (
                        <Book size={48} className="text-gray-400" />
                      )}
                    </div>
                  </Link>
                  <div className="p-6 flex flex-col flex-grow">
                    <p className="text-sm text-amber-600 font-semibold">
                      {resource.type} - {resource.category}
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mt-2 mb-2 hover:text-blue-600">
                      <Link href={`/resources/${resource.id}`}>
                        {resource.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 text-sm flex-grow">
                      {resource.description.length > 100
                        ? `${resource.description.substring(0, 100)}...`
                        : resource.description}
                    </p>
                    <div className="mt-4 border-t pt-4 flex justify-between items-center text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>
                          {new Date(resource.uploadDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Download size={16} />
                        <span>{resource.downloads} Downloads</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 px-6 bg-white rounded-lg shadow-md">
              <Book size={48} className="mx-auto text-gray-400" />
              <h3 className="mt-4 text-xl font-semibold text-gray-800">
                No Resources Found
              </h3>
              <p className="mt-2 text-gray-600">
                You have not uploaded any resources yet. Why not share something
                with the community?
              </p>
              <Link href="/upload">
                <span className="mt-6 inline-block bg-amber-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors">
                  Upload a Resource
                </span>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

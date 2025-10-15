"use server";
import { db } from "@/firebase";
import { collection, getDocs, query } from "firebase/firestore";

export async function getAllStudents() {
  try {
    const studentsRef = collection(db, "students");
    const q = query(studentsRef);
    const querySnapshot = await getDocs(q);

    const students = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    return students;
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
}
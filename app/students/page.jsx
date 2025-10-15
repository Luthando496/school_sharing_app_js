"use client";
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getAllStudents } from '@/actions/studentActions';
import StartChatButton from '@/components/StartChatButton'; // We created this in a previous step
import { User } from 'lucide-react';

export default function StudentsPage() {
    const [students, setStudents] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get the currently logged-in user
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });

        // Fetch all students
        const fetchStudents = async () => {
            const studentList = await getAllStudents();
            setStudents(studentList);
            setLoading(false);
        };
        
        fetchStudents();
        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div className="text-center py-10">Loading students...</div>;
    }
    
    return (
        <div className="min-h-screen bg-primary py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold primary-text mb-6">Find Students</h1>
                <div className="card-bg rounded-xl shadow-lg p-4 space-y-3">
                    {students.map(student => (
                        <div key={student.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100">
                            <div className="flex items-center gap-4">
                                {student.profile_image ? (
                                    <img src={student.profile_image} alt={student.studentName} className="w-12 h-12 rounded-full object-cover" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                        <User className="text-gray-500" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold primary-text">{student.studentName} {student.studentSurname}</p>
                                    <p className="text-sm secondary-text">{student.email}</p>
                                </div>
                            </div>
                            {/* The button that starts the chat! */}
                            <StartChatButton currentUser={currentUser} targetUserId={student.id} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
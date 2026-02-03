import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export default function PendingStudents() {
  const [students, setStudents] = useState([]);

  /* 🔁 REAL-TIME PENDING STUDENTS */
  useEffect(() => {
    const q = query(
      collection(db, "users"),
      where("role", "==", "student"),
      where("status", "==", "pending")
    );

    const unsub = onSnapshot(q, (snap) => {
      setStudents(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    });

    return () => unsub();
  }, []);

  /* ================= ACTIONS ================= */

  const approveStudent = async (id) => {
    await updateDoc(doc(db, "users", id), {
      status: "approved",
      approvedAt: serverTimestamp(),
    });
  };

  const rejectStudent = async (id) => {
    await updateDoc(doc(db, "users", id), {
      status: "rejected",
      rejectedAt: serverTimestamp(),
    });
  };

  return (
    <div className="section">
      <h2>Pending Student Accounts</h2>

      {students.length === 0 && (
        <p className="muted">No pending students</p>
      )}

      <div className="card-grid">
        {students.map((student) => (
          <div key={student.id} className="glass-card">
            {/* ✅ REQUIRED FORMAT */}
            <p>
              <strong>Name :</strong> {student.name}
            </p>

            <p>
              <strong>Email :</strong> {student.email}
            </p>

            <div className="btn-row">
              <button
                className="primary-btn"
                onClick={() => approveStudent(student.id)}
              >
                Approve
              </button>

              <button
                className="danger-btn"
                onClick={() => rejectStudent(student.id)}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

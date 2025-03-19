import React, { useState, useEffect } from 'react';
import { db } from './firebase';  // Import Firebase Firestore

const AssignmentList = () => {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    // Real-time listener to get assignments from Firestore
    const unsubscribe = db.collection('assignments')
      .orderBy('createdAt', 'desc') // Order by timestamp (optional)
      .onSnapshot((snapshot) => {
        setAssignments(snapshot.docs.map(doc => doc.data()));
      });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h2>Uploaded Assignments</h2>
      {assignments.length === 0 ? (
        <p>No assignments uploaded yet.</p>
      ) : (
        <ul>
          {assignments.map((assignment, index) => (
            <li key={index}>
              <h3>{assignment.name}</h3>
              <p>Uploaded on: {new Date(assignment.createdAt.seconds * 1000).toLocaleString()}</p>
              <a href={assignment.url} target="_blank" rel="noopener noreferrer">
                Download Assignment
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AssignmentList;

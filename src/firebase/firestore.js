import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

// ─── Progress Entries (original) ─────────────────────

export async function addProgress(userId, data) {
  const entriesRef = collection(db, 'progress', userId, 'entries');
  const docRef = await addDoc(entriesRef, {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getProgress(userId) {
  const entriesRef = collection(db, 'progress', userId, 'entries');
  const q = query(entriesRef, orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateProgress(userId, docId, data) {
  const docRef = doc(db, 'progress', userId, 'entries', docId);
  await updateDoc(docRef, data);
}

export async function deleteProgress(userId, docId) {
  const docRef = doc(db, 'progress', userId, 'entries', docId);
  await deleteDoc(docRef);
}

// ─── Routine Habits ──────────────────────────────────

export async function getRoutines(userId) {
  const ref = collection(db, 'routines', userId, 'items');
  const q = query(ref, orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addRoutine(userId, data) {
  const ref = collection(db, 'routines', userId, 'items');
  const docRef = await addDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateRoutine(userId, routineId, data) {
  const docRef = doc(db, 'routines', userId, 'items', routineId);
  await updateDoc(docRef, data);
}

export async function deleteRoutine(userId, routineId) {
  const docRef = doc(db, 'routines', userId, 'items', routineId);
  await deleteDoc(docRef);
}

// ─── Daily Check-ins ─────────────────────────────────

export async function getCheckins(userId, date) {
  const docRef = doc(db, 'routines', userId, 'checkins', date);
  const snap = await getDoc(docRef);
  if (snap.exists()) return snap.data();
  return { completed: [] };
}

export async function saveCheckins(userId, date, completedIds) {
  const docRef = doc(db, 'routines', userId, 'checkins', date);
  await setDoc(docRef, { completed: completedIds, updatedAt: serverTimestamp() });
}

export async function getCheckinRange(userId, startDate, endDate) {
  const ref = collection(db, 'routines', userId, 'checkins');
  const snapshot = await getDocs(ref);
  const result = {};
  snapshot.docs.forEach((d) => {
    if (d.id >= startDate && d.id <= endDate) {
      result[d.id] = d.data();
    }
  });
  return result;
}

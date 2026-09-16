import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { Roadmap, RoadmapTask, UserProfile, VideoResource } from "@/types";
import { GeneratedStep } from "./geminiService";
import { fetchYouTubeResources } from "./youtubeService";

// Helper to update user aggregate statistics dynamically
export async function recalculateUserStats(uid: string): Promise<void> {
  try {
    const roadmapsRef = collection(db, "roadmaps");
    const q = query(roadmapsRef, where("ownerId", "==", uid));
    const roadmapsSnap = await getDocs(q);

    const roadmapsCount = roadmapsSnap.size;
    let totalTasksCount = 0;
    let completedTasksCount = 0;

    for (const roadmapDoc of roadmapsSnap.docs) {
      const tasksRef = collection(db, "roadmaps", roadmapDoc.id, "tasks");
      const tasksSnap = await getDocs(tasksRef);
      totalTasksCount += tasksSnap.size;
      tasksSnap.docs.forEach((tDoc) => {
        if (tDoc.data().completed) {
          completedTasksCount++;
        }
      });
    }

    const inProgressCount = totalTasksCount - completedTasksCount;
    const overallPct = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      "stats.roadmapsCreated": roadmapsCount,
      "stats.tasksCompleted": completedTasksCount,
      "stats.tasksInProgress": inProgressCount,
      "stats.overallCompletion": overallPct
    });
  } catch (err) {
    console.error("Error recalculating user stats:", err);
  }
}

// Create a new AI-generated roadmap and store steps in subcollection
export async function createAIRoadmap(
  uid: string,
  careerTitle: string,
  steps: GeneratedStep[]
): Promise<string> {
  const roadmapRef = doc(collection(db, "roadmaps"));
  const roadmapId = roadmapRef.id;

  const newRoadmap: Roadmap = {
    id: roadmapId,
    ownerId: uid,
    careerTitle,
    totalSteps: steps.length,
    source: "ai",
    createdAt: new Date().toISOString()
  };

  await setDoc(roadmapRef, newRoadmap);

  const batch = writeBatch(db);
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const taskRef = doc(collection(db, "roadmaps", roadmapId, "tasks"));
    
    // Fetch initial YouTube videos lazily or during creation
    const searchQuery = step.searchKeywords && step.searchKeywords.length > 0
      ? `${careerTitle} ${step.searchKeywords[0]}`
      : `${careerTitle} ${step.title} tutorial`;
      
    const initialVideos = await fetchYouTubeResources(searchQuery);

    const newTask: RoadmapTask = {
      id: taskRef.id,
      roadmapId,
      title: step.title,
      description: step.description,
      order: step.order || i + 1,
      completed: false,
      completedAt: null,
      isCustomGoal: false,
      searchKeywords: step.searchKeywords || [],
      videos: initialVideos
    };

    batch.set(taskRef, newTask);
  }

  await batch.commit();
  await recalculateUserStats(uid);

  return roadmapId;
}

// Subscribe to all roadmaps owned by user
export function subscribeUserRoadmaps(
  uid: string,
  onUpdate: (roadmaps: Roadmap[]) => void
) {
  const roadmapsRef = collection(db, "roadmaps");
  const q = query(roadmapsRef, where("ownerId", "==", uid));

  return onSnapshot(q, (snapshot) => {
    const list: Roadmap[] = snapshot.docs.map((docSnap) => ({
      ...(docSnap.data() as Roadmap),
      id: docSnap.id
    }));
    
    // Sort in memory by createdAt desc
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onUpdate(list);
  }, (err) => {
    console.error("Firestore roadmaps subscription error:", err);
  });
}

// Subscribe to tasks for a specific roadmap
export function subscribeRoadmapTasks(
  roadmapId: string,
  onUpdate: (tasks: RoadmapTask[]) => void
) {
  const tasksRef = collection(db, "roadmaps", roadmapId, "tasks");

  return onSnapshot(tasksRef, (snapshot) => {
    const tasks: RoadmapTask[] = snapshot.docs.map((docSnap) => ({
      ...(docSnap.data() as RoadmapTask),
      id: docSnap.id
    }));
    tasks.sort((a, b) => a.order - b.order);
    onUpdate(tasks);
  }, (err) => {
    console.error("Firestore tasks subscription error:", err);
  });
}

// Get single roadmap metadata
export async function getRoadmapDoc(roadmapId: string): Promise<Roadmap | null> {
  const snap = await getDoc(doc(db, "roadmaps", roadmapId));
  if (!snap.exists()) return null;
  return { ...(snap.data() as Roadmap), id: snap.id };
}

// Toggle completion of a task
export async function toggleTaskCompletion(
  uid: string,
  roadmapId: string,
  taskId: string,
  currentStatus: boolean
): Promise<void> {
  const taskRef = doc(db, "roadmaps", roadmapId, "tasks", taskId);
  const newStatus = !currentStatus;

  await updateDoc(taskRef, {
    completed: newStatus,
    completedAt: newStatus ? new Date().toISOString() : null
  });

  await recalculateUserStats(uid);
}

// Toggle watched status of a video within a task
export async function toggleVideoWatched(
  roadmapId: string,
  taskId: string,
  videoId: string,
  watchedState: boolean
): Promise<void> {
  const taskRef = doc(db, "roadmaps", roadmapId, "tasks", taskId);
  const taskSnap = await getDoc(taskRef);
  if (!taskSnap.exists()) return;

  const taskData = taskSnap.data() as RoadmapTask;
  const updatedVideos = (taskData.videos || []).map((v) =>
    v.videoId === videoId ? { ...v, watched: watchedState } : v
  );

  await updateDoc(taskRef, { videos: updatedVideos });
}

// Add a custom goal/task to a roadmap
export async function addCustomGoal(
  uid: string,
  roadmapId: string,
  title: string,
  description: string = ""
): Promise<string> {
  const tasksRef = collection(db, "roadmaps", roadmapId, "tasks");
  const tasksSnap = await getDocs(tasksRef);
  const maxOrder = tasksSnap.docs.reduce((max, d) => Math.max(max, d.data().order || 0), 0);

  const newTaskRef = doc(tasksRef);

  // Fetch optional YouTube resources for custom goal title
  const videos = await fetchYouTubeResources(title);

  const customTask: RoadmapTask = {
    id: newTaskRef.id,
    roadmapId,
    title,
    description,
    order: maxOrder + 1,
    completed: false,
    completedAt: null,
    isCustomGoal: true,
    videos
  };

  await setDoc(newTaskRef, customTask);

  // Update totalSteps on parent roadmap
  const roadmapRef = doc(db, "roadmaps", roadmapId);
  const roadmapSnap = await getDoc(roadmapRef);
  if (roadmapSnap.exists()) {
    const currentTotal = roadmapSnap.data().totalSteps || 0;
    await updateDoc(roadmapRef, { totalSteps: currentTotal + 1 });
  }

  await recalculateUserStats(uid);
  return newTaskRef.id;
}

// Delete roadmap and its subcollections
export async function deleteRoadmap(uid: string, roadmapId: string): Promise<void> {
  const tasksRef = collection(db, "roadmaps", roadmapId, "tasks");
  const tasksSnap = await getDocs(tasksRef);

  const batch = writeBatch(db);
  tasksSnap.docs.forEach((tDoc) => {
    batch.delete(tDoc.ref);
  });
  batch.delete(doc(db, "roadmaps", roadmapId));

  await batch.commit();
  await recalculateUserStats(uid);
}

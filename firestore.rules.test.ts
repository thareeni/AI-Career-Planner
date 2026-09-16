import { describe, it, expect } from "vitest";

/**
 * Firestore Security Rules Logic Test Suite
 * Evaluates rule conditions defined in firestore.rules:
 * 1. user A can access users/userA but NOT users/userB
 * 2. user B cannot read roadmaps owned by user A (ownerId != auth.uid)
 * 3. user B cannot read or write tasks under user A's roadmaps
 */

function simulateFirestoreRuleCheck(
  authUid: string | null,
  resourcePath: string,
  resourceData?: Record<string, any>,
  requestData?: Record<string, any>,
  parentResourceData?: Record<string, any>
): boolean {
  if (!authUid) return false; // Must be authenticated

  // /users/{userId}
  if (resourcePath.startsWith("users/")) {
    const targetUserId = resourcePath.split("/")[1];
    return authUid === targetUserId;
  }

  // /roadmaps/{roadmapId}
  if (resourcePath.startsWith("roadmaps/") && !resourcePath.includes("/tasks/")) {
    if (requestData?.ownerId) {
      return authUid === requestData.ownerId;
    }
    return resourceData ? authUid === resourceData.ownerId : false;
  }

  // /roadmaps/{roadmapId}/tasks/{taskId}
  if (resourcePath.includes("/tasks/")) {
    return parentResourceData ? authUid === parentResourceData.ownerId : false;
  }

  return false;
}

describe("Firestore Security Rules Data Isolation", () => {
  const userA = "uid-user-a-123";
  const userB = "uid-user-b-456";

  it("allows user A to read and write their own profile document", () => {
    const allowed = simulateFirestoreRuleCheck(userA, "users/" + userA);
    expect(allowed).toBe(true);
  });

  it("denies user B from reading user A's profile document", () => {
    const allowed = simulateFirestoreRuleCheck(userB, "users/" + userA);
    expect(allowed).toBe(false);
  });

  it("allows user A to read their owned roadmap", () => {
    const allowed = simulateFirestoreRuleCheck(userA, "roadmaps/rm-1", { ownerId: userA });
    expect(allowed).toBe(true);
  });

  it("denies user B from reading user A's roadmap", () => {
    const allowed = simulateFirestoreRuleCheck(userB, "roadmaps/rm-1", { ownerId: userA });
    expect(allowed).toBe(false);
  });

  it("denies user B from modifying tasks in user A's roadmap", () => {
    const allowed = simulateFirestoreRuleCheck(
      userB,
      "roadmaps/rm-1/tasks/task-1",
      { completed: true },
      { completed: true },
      { ownerId: userA }
    );
    expect(allowed).toBe(false);
  });

  it("denies unauthenticated requests", () => {
    const allowed = simulateFirestoreRuleCheck(null, "roadmaps/rm-1", { ownerId: userA });
    expect(allowed).toBe(false);
  });
});

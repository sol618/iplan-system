// 특정 학부모/학생 데이터를 localStorage에서 일괄 정리하는 1회성 마이그레이션.
// 시드 데이터가 아니라 사용자의 브라우저 localStorage에 남아 있는 잔여 데이터를 제거한다.
// - 같은 이름으로 재가입한 정상 사용자를 지우지 않도록, DONE 플래그로 '단 한 번만' 실행한다.
// - 새 이름을 정리해야 하면 NAMES_TO_REMOVE에 추가하고 CLEANUP_VERSION을 올린다.

const NAMES_TO_REMOVE = ["이영희"];
const CLEANUP_VERSION = "v1";
const DONE_KEY = `iplan-cleanup-${CLEANUP_VERSION}-done`;

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

// 정리 대상 이름과 일치하는지 (학부모 이름 또는 자녀 이름)
function isTargetName(...names: (string | undefined)[]): boolean {
  return names.some(n => n != null && NAMES_TO_REMOVE.includes(n));
}

export function runDataCleanup(): void {
  if (typeof localStorage === "undefined") return;
  if (localStorage.getItem(DONE_KEY) === "true") return;

  // 1) 회원 DB(iplan-users)에서 대상 사용자를 제거하고, 그 userId 목록을 수집한다.
  const users = readJSON<{ userId: string; name?: string; childName?: string }[]>("iplan-users", []);
  const removedUserIds = new Set(
    users.filter(u => isTargetName(u.name, u.childName)).map(u => u.userId)
  );
  const remainingUsers = users.filter(u => !isTargetName(u.name, u.childName));
  if (remainingUsers.length !== users.length) {
    localStorage.setItem("iplan-users", JSON.stringify(remainingUsers));
  }

  const matchesTarget = (item: { parentUserId?: string; parentName?: string; childName?: string }) =>
    (item.parentUserId != null && removedUserIds.has(item.parentUserId)) ||
    isTargetName(item.parentName, item.childName);

  // 2) 전역 스케줄/행사에서 대상 데이터를 제거한다.
  for (const key of ["iplan-global-schedules", "iplan-global-events"]) {
    const arr = readJSON<{ parentUserId?: string; parentName?: string; childName?: string }[]>(key, []);
    const filtered = arr.filter(item => !matchesTarget(item));
    if (filtered.length !== arr.length) {
      localStorage.setItem(key, JSON.stringify(filtered));
    }
  }

  // 3) 알림에서 대상 데이터를 제거한다.
  const notifications = readJSON<{ parentUserId?: string; parentName?: string; childName?: string }[]>("notifications", []);
  const filteredNotifications = notifications.filter(n => !matchesTarget(n));
  if (filteredNotifications.length !== notifications.length) {
    localStorage.setItem("notifications", JSON.stringify(filteredNotifications));
  }

  // 4) 제거된 사용자별 부수 데이터(자녀 목록, 시딩 기록)를 정리한다.
  if (removedUserIds.size > 0) {
    removedUserIds.forEach(id => localStorage.removeItem(`iplan-${id}-children`));

    const seeded = readJSON<string[]>("iplan-seeded-users", []);
    const remainingSeeded = seeded.filter(id => !removedUserIds.has(id));
    if (remainingSeeded.length !== seeded.length) {
      localStorage.setItem("iplan-seeded-users", JSON.stringify(remainingSeeded));
    }
  }

  localStorage.setItem(DONE_KEY, "true");
}

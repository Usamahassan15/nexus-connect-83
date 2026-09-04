// Lightweight mock social graph (localStorage backed) so follows persist across pages.
export interface GraphUser {
  key: string; // slug
  name: string;
  avatar?: string;
}

const KEY_FOLLOWING = "social_following";
const KEY_FOLLOWERS = "social_followers";

export const slugify = (name: string) =>
  name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const listeners = new Set<() => void>();

const read = (key: string): GraphUser[] => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as GraphUser[]) : [];
  } catch {
    return [];
  }
};

const write = (key: string, list: GraphUser[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
};

export const getFollowing = () => read(KEY_FOLLOWING);
export const getFollowers = () => read(KEY_FOLLOWERS);

export const isFollowing = (name: string) => {
  const key = slugify(name);
  return getFollowing().some((u) => u.key === key);
};

export const followUser = (user: { name: string; avatar?: string }) => {
  const entry: GraphUser = { key: slugify(user.name), name: user.name, avatar: user.avatar };
  const following = getFollowing();
  if (!following.some((u) => u.key === entry.key)) write(KEY_FOLLOWING, [entry, ...following]);
  // Mock reciprocity: the user follows back, so they appear in your followers too.
  const followers = getFollowers();
  if (!followers.some((u) => u.key === entry.key)) write(KEY_FOLLOWERS, [entry, ...followers]);
  return true;
};

export const unfollowUser = (name: string) => {
  const key = slugify(name);
  write(KEY_FOLLOWING, getFollowing().filter((u) => u.key !== key));
  return false;
};

export const toggleFollow = (user: { name: string; avatar?: string }) =>
  isFollowing(user.name) ? unfollowUser(user.name) : followUser(user);

export const subscribeGraph = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const profilePath = (name: string, avatar?: string) =>
  `/user/${slugify(name)}?name=${encodeURIComponent(name)}${avatar ? `&avatar=${encodeURIComponent(avatar)}` : ""}`;

export const chatPath = (name: string, avatar?: string) =>
  `/messages?user=${encodeURIComponent(name)}${avatar ? `&avatar=${encodeURIComponent(avatar)}` : ""}`;

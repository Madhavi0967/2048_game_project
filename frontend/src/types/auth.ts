export interface UserProfile {
  id: string;
  username: string;
  email: string;
  token?: string;
  avatarColor?: string;
  createdAt?: string;
  highScore?: number;
  gamesPlayed?: number;
}

export interface Project {
  name: string;
  repo: string;
  platform: string;
  stack: string;
  description: string;
  descriptionEn: string;
  icon: "desktop" | "book" | "chat" | "lock" | "tiles";
  download?: string;
}

export const projects: Project[] = [
  { name: "StarGlass", repo: "StarGlass", platform: "Windows", stack: "Electron / React / C++", description: "GitHub Stars 与 Release 下载量监控", descriptionEn: "GitHub Stars and release download monitoring", icon: "desktop", download: "https://github.com/LoMoCatAp/StarGlass/releases" },
  { name: "Bika-HarmonyOS", repo: "Bika-HarmonyOS", platform: "HarmonyOS", stack: "ArkTS / ArkUI", description: "漫画浏览、阅读与离线下载", descriptionEn: "Comic browsing, reading and offline downloads", icon: "book" },
  { name: "AIBox", repo: "ImmersiveAI", platform: "HarmonyOS", stack: "ArkTS / ArkUI", description: "多服务商聊天、流式回复与会话管理", descriptionEn: "Multi-provider chat, streaming replies and conversation management", icon: "chat" },
  { name: "FileEncryptor", repo: "FileEncryptor", platform: "Windows", stack: "C / C++ / WebView2", description: "AES-256-GCM 文件加密与解密", descriptionEn: "AES-256-GCM file encryption and decryption", icon: "lock" },
  { name: "AppLock", repo: "AppLock", platform: "Windows", stack: "C++ / Node.js", description: "Windows Hello 应用认证与锁定", descriptionEn: "Windows Hello authentication and application locking", icon: "lock" },
  { name: "JavaMahjong", repo: "JavaMahjong_web", platform: "Java / Web", stack: "Spring Boot / WebSocket", description: "山东推倒胡、多人实时联机", descriptionEn: "Shandong mahjong and real-time multiplayer", icon: "tiles" },
];

export const otherProjects = [
  { name: "PezMax-HarmonyOS", stack: "ArkTS / ArkUI", note: "资料管理、云端书签与文件下载", noteEn: "Resource management, cloud bookmarks and file downloads", repo: "PezMax-HarmonyOS" },
  { name: "snakeEat", stack: "C / EasyX", note: "贪吃蛇、动态难度与最高分记录", noteEn: "Snake, dynamic difficulty and high scores", repo: "snakeEat" },
  { name: "群昵称定时插件", stack: "Python / AstrBot / OneBot", note: "定时随机更新 QQ 群名片", noteEn: "Scheduled random QQ group nickname updates", repo: "astrbot_plugin_group_nickname_scheduler" },
  { name: "这个网站", stack: "Next.js / React / SQLite", note: "项目展示、Markdown 博客与小游戏", noteEn: "Projects, a Markdown blog and games", repo: "my-blog" },
];

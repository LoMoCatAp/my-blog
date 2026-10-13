import { getDb } from "@/lib/db";
import FriendLinks, {type FriendLink} from "./FriendLinks";

export const metadata = {
  title: "友链",
  description: "友情链接",
};
export const dynamic = "force-dynamic";

export default function LinksPage() {
  const db = getDb();
  const links = db.prepare("SELECT id, name, url, description FROM links ORDER BY sort_order ASC, id ASC").all() as FriendLink[];
  return <FriendLinks links={links}/>;
}

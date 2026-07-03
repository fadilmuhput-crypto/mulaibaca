import { Metadata } from "next";
import ThreadsClient from "./ThreadsClient";

export const metadata: Metadata = {
  title: "Threads CRM — mulaibaca admin",
};

export default function ThreadsPage() {
  return <ThreadsClient />;
}

import type { Metadata } from "next";
import { Legal } from "@/components/legal";

export const metadata: Metadata = { title: "Privacy", description: "What Skinmatch keeps, and what it never stores." };

export default function Privacy() {
  return (
    <Legal title="Privacy" updated="November 2, 2026">
      <p>Short version: we keep what we need to build your routine, we never store your photos, and you can delete everything anytime.</p>
      <h2>What we keep</h2>
      <ul>
        <li>Your email and, if you sign in with Google, your name and profile picture.</li>
        <li>Your answers (skin type), the products on your shelf, your routine checks and your skin diary entries.</li>
        <li>Usage counts (how many checks and scans you used this month) to apply your plan's limits.</li>
        <li>For free tries without an account: a random device id and a one-way hash of your IP address, to limit free tries to 3 a day.</li>
      </ul>
      <h2>Your photos</h2>
      <p>
        When you snap a label, the photo is sent once to Google Gemini to read the product names, then dropped. We never store it on our servers. A tiny preview
        stays in your own browser so you can see your result; you can clear it by deleting your account or your browser data.
      </p>
      <h2>Services we use</h2>
      <ul>
        <li>Supabase: database and sign-in (United States).</li>
        <li>Vercel: hosting.</li>
        <li>Google Gemini: reading product labels and identifying products you type.</li>
        <li>Whop, through Kwop: payments. We never see your card number.</li>
        <li>Visit analytics by Kwop on our public pages (home, sign-up, log-in, legal pages), not inside the app.</li>
      </ul>
      <h2>Your choices</h2>
      <p>
        You can change your skin type and products anytime, and delete your account with all its data from Account → Your data. We don't sell your data and don't
        show ads.
      </p>
    </Legal>
  );
}

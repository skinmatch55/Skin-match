import type { Metadata } from "next";
import { Legal } from "@/components/legal";

export const metadata: Metadata = { title: "Terms", description: "The simple rules for using Skinmatch." };

export default function Terms() {
  return (
    <Legal title="Terms" updated="November 2, 2026">
      <p>These terms cover your use of Skinmatch. By creating an account, you agree to them.</p>
      <h2>What Skinmatch is</h2>
      <p>
        Skinmatch checks which skincare products shouldn't be used together and suggests an order for your morning and night routine. It gives general skincare
        guidance based on widely accepted layering rules. <b>It is not medical advice</b> and doesn't diagnose or treat any condition. If you use prescription
        products or have a skin condition, follow your dermatologist.
      </p>
      <h2>Your account</h2>
      <p>You need a valid email to create an account. Keep your password private. You can delete your account anytime from Account.</p>
      <h2>Plans and payments</h2>
      <ul>
        <li>Paid plans renew automatically every month or year until you cancel.</li>
        <li>Payments are processed by Whop, through our payments partner Kwop. Prices are in USD.</li>
        <li>You can cancel anytime from Account → Billing. You keep access until the end of the period you paid for.</li>
        <li>Each plan has monthly limits (routine checks, label scans, products on your shelf), shown before you pay and in your account.</li>
      </ul>
      <h2>Fair use</h2>
      <p>Don't misuse the service: no automated scraping, no attempts to get around limits, no illegal content in uploads.</p>
      <h2>Changes</h2>
      <p>We may update these terms. If a change matters, we'll tell you in the app before it applies.</p>
      <h2>Contact</h2>
      <p>Questions? Write to us from the email linked to your account and we'll answer.</p>
    </Legal>
  );
}

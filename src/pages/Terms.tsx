import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Platonic Conduct Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              PeerPair Kenya is a strictly platonic companionship marketplace. All services 
              offered and received through this platform must be non-romantic and non-sexual 
              in nature. Users agree to maintain professional conduct at all times.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
              <li>No romantic or sexual services of any kind</li>
              <li>All interactions must remain professional</li>
              <li>Physical contact limited to socially acceptable greetings</li>
              <li>Respect personal boundaries at all times</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed">
              Companions may be booked for professional events, dinners, tours, 
              networking events, social gatherings, and similar platonic occasions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. Payment Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              All payments are processed via M-Pesa and held in escrow until service 
              completion. Upon client confirmation, 80% is released to the companion 
              and 20% is retained by the platform as a service fee.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Cancellation Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Bookings may be cancelled before the companion accepts. Once accepted 
              and payment is in escrow, cancellation terms apply based on timing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Verification</h2>
            <p className="text-muted-foreground leading-relaxed">
              All companions undergo verification. Users must be 18 years or older 
              to use this platform. False information will result in account termination.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              PeerPair Kenya facilitates connections but is not liable for any 
              disputes between users. All interactions are at users' own risk.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-border">
          <Button asChild>
            <Link to="/signup">Accept & Create Account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

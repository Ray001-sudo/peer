import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EmailRequest {
  booking_id: string;
  type: "booking_created" | "payment_confirmed" | "booking_completed" | "booking_cancelled";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const resend = new Resend(resendApiKey);

    const { booking_id, type }: EmailRequest = await req.json();

    if (!booking_id || !type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration missing");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch booking with client and companion details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", booking_id)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found");
    }

    // Fetch client profile
    const { data: client } = await supabase
      .from("profiles")
      .select("full_name, phone_number")
      .eq("id", booking.client_id)
      .single();

    // Fetch companion profile
    const { data: companion } = await supabase
      .from("profiles")
      .select("full_name, phone_number")
      .eq("id", booking.companion_id)
      .single();

    // Get client email from auth.users
    const { data: clientAuth } = await supabase.auth.admin.getUserById(booking.client_id);
    const clientEmail = clientAuth?.user?.email;

    // Get companion email from auth.users
    const { data: companionAuth } = await supabase.auth.admin.getUserById(booking.companion_id);
    const companionEmail = companionAuth?.user?.email;

    const emailTemplates = {
      booking_created: {
        subject: "New Booking Request - PeerPair",
        clientHtml: `
          <h1>Booking Request Sent!</h1>
          <p>Hi ${client?.full_name || "there"},</p>
          <p>Your booking request has been submitted successfully.</p>
          <ul>
            <li><strong>Companion:</strong> ${companion?.full_name || "N/A"}</li>
            <li><strong>Type:</strong> ${booking.booking_type}</li>
            <li><strong>Duration:</strong> ${booking.duration}</li>
            <li><strong>Amount:</strong> KES ${booking.total_amount.toLocaleString()}</li>
          </ul>
          <p>Please complete the M-Pesa payment to confirm your booking.</p>
          <p>Thanks,<br>The PeerPair Team</p>
        `,
        companionHtml: `
          <h1>New Booking Request!</h1>
          <p>Hi ${companion?.full_name || "there"},</p>
          <p>You have received a new booking request.</p>
          <ul>
            <li><strong>Client:</strong> ${client?.full_name || "N/A"}</li>
            <li><strong>Type:</strong> ${booking.booking_type}</li>
            <li><strong>Duration:</strong> ${booking.duration}</li>
            <li><strong>Amount:</strong> KES ${booking.total_amount.toLocaleString()}</li>
          </ul>
          <p>The client will complete payment via M-Pesa. You'll be notified when funds are in escrow.</p>
          <p>Thanks,<br>The PeerPair Team</p>
        `,
      },
      payment_confirmed: {
        subject: "Payment Confirmed - Funds in Escrow",
        clientHtml: `
          <h1>Payment Successful!</h1>
          <p>Hi ${client?.full_name || "there"},</p>
          <p>Your M-Pesa payment has been received and the funds are now held in escrow.</p>
          <ul>
            <li><strong>Companion:</strong> ${companion?.full_name || "N/A"}</li>
            <li><strong>Amount Paid:</strong> KES ${booking.total_amount.toLocaleString()}</li>
          </ul>
          <p>The funds will be released to the companion upon service completion.</p>
          <p>Thanks,<br>The PeerPair Team</p>
        `,
        companionHtml: `
          <h1>Booking Confirmed!</h1>
          <p>Hi ${companion?.full_name || "there"},</p>
          <p>Payment has been received and funds are now in escrow for your booking.</p>
          <ul>
            <li><strong>Client:</strong> ${client?.full_name || "N/A"}</li>
            <li><strong>Amount:</strong> KES ${booking.total_amount.toLocaleString()}</li>
          </ul>
          <p>Once the service is completed, the funds will be released to you (80% after platform fee).</p>
          <p>Thanks,<br>The PeerPair Team</p>
        `,
      },
      booking_completed: {
        subject: "Booking Completed - PeerPair",
        clientHtml: `
          <h1>Booking Completed!</h1>
          <p>Hi ${client?.full_name || "there"},</p>
          <p>Your booking has been marked as completed. Thank you for using PeerPair!</p>
          <p>We hope you had a great experience.</p>
          <p>Thanks,<br>The PeerPair Team</p>
        `,
        companionHtml: `
          <h1>Payment Released!</h1>
          <p>Hi ${companion?.full_name || "there"},</p>
          <p>The booking has been marked as completed and the funds have been released to your M-Pesa.</p>
          <ul>
            <li><strong>Total:</strong> KES ${booking.total_amount.toLocaleString()}</li>
            <li><strong>Your Earnings (80%):</strong> KES ${(booking.total_amount * 0.8).toLocaleString()}</li>
          </ul>
          <p>Thanks for being a great companion!</p>
          <p>Thanks,<br>The PeerPair Team</p>
        `,
      },
      booking_cancelled: {
        subject: "Booking Cancelled - PeerPair",
        clientHtml: `
          <h1>Booking Cancelled</h1>
          <p>Hi ${client?.full_name || "there"},</p>
          <p>Your booking has been cancelled. If funds were in escrow, they will be refunded to your M-Pesa.</p>
          <p>Thanks,<br>The PeerPair Team</p>
        `,
        companionHtml: `
          <h1>Booking Cancelled</h1>
          <p>Hi ${companion?.full_name || "there"},</p>
          <p>A booking has been cancelled.</p>
          <p>Thanks,<br>The PeerPair Team</p>
        `,
      },
    };

    const template = emailTemplates[type];

    const emailPromises: Promise<any>[] = [];

    // Send to client
    if (clientEmail) {
      emailPromises.push(
        resend.emails.send({
          from: "PeerPair <noreply@resend.dev>", // Replace with verified domain
          to: [clientEmail],
          subject: template.subject,
          html: template.clientHtml,
        })
      );
    }

    // Send to companion
    if (companionEmail) {
      emailPromises.push(
        resend.emails.send({
          from: "PeerPair <noreply@resend.dev>", // Replace with verified domain
          to: [companionEmail],
          subject: template.subject,
          html: template.companionHtml,
        })
      );
    }

    await Promise.all(emailPromises);

    console.log(`Emails sent for booking ${booking_id}, type: ${type}`);

    return new Response(
      JSON.stringify({ success: true, message: "Emails sent" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Email sending error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface MPesaCallbackItem {
  Name: string;
  Value: string | number;
}

interface MPesaCallback {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: MPesaCallbackItem[];
      };
    };
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const callback: MPesaCallback = await req.json();
    const { stkCallback } = callback.Body;

    console.log("M-Pesa Callback received:", JSON.stringify(stkCallback));

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration missing");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find booking by checkout request ID
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("mpesa_checkout_id", stkCallback.CheckoutRequestID)
      .single();

    if (fetchError || !booking) {
      console.error("Booking not found for checkout ID:", stkCallback.CheckoutRequestID);
      return new Response(JSON.stringify({ success: false }), {
        status: 200, // M-Pesa expects 200
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (stkCallback.ResultCode === 0) {
      // Payment successful - update to funded_escrow
      const { error: updateError } = await supabase
        .from("bookings")
        .update({ status: "funded_escrow" })
        .eq("id", booking.id);

      if (updateError) {
        console.error("Failed to update booking status:", updateError);
      }

      // Trigger email notification
      try {
        await fetch(`${supabaseUrl}/functions/v1/send-booking-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            booking_id: booking.id,
            type: "payment_confirmed",
          }),
        });
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
      }

      console.log("Payment successful for booking:", booking.id);
    } else {
      // Payment failed
      console.log("Payment failed:", stkCallback.ResultDesc);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("M-Pesa callback error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 200, // M-Pesa expects 200
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);

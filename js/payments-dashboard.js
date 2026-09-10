import { supabase } from "./supabaseClient.js";
const paymentsContainer = document.getElementById("paymentsContainer");
async function loadPayments() {
  if (!paymentsContainer) return;
  paymentsContainer.innerHTML = `
        <div class="loading-state">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <p>Loading payment requests...</p>
        </div>
    `;
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      window.location.href = "login.html";
      return;
    }
    const { data: payments, error } = await supabase
      .from("payments")
      .select(
        `
                id,
                album_id,
                amount,
                currency,
                status,
                payment_method,
                selected_photos,
                created_at,
                albums (
                    id,
                    name
                )
            `,
      )
      .eq("status", "pending")
      .order("created_at", {
        ascending: false,
      });
    if (error) {
      throw error;
    }
    if (!payments || payments.length === 0) {
      paymentsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fa-regular fa-inbox"></i>
                    <p>No pending payment requests.</p>
                    <small>Payment requests will appear here when customers submit payments.</small>
                </div>
            `;
      return;
    }
    paymentsContainer.innerHTML = payments
      .map((payment) => {
        const photoCount = Array.isArray(payment.selected_photos)
          ? payment.selected_photos.length
          : 0;
        const createdAt = new Date(payment.created_at);
        const daysAgo = Math.floor(
          (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
        );
        const timeString =
          daysAgo === 0
            ? "Today"
            : daysAgo === 1
              ? "Yesterday"
              : `${daysAgo} days ago`;
        return `
                    <div class="payment-request-card pending">
                        <div class="payment-request-header">
                            <div class="payment-title">
                                <h3>${escapeHtml(
                                  payment.albums?.name || "Unknown Album",
                                )}</h3>
                                <span class="payment-badge pending">
                                    <i class="fa-solid fa-clock"></i>
                                    Pending Verification
                                </span>
                            </div>
                            <div class="payment-amount">
                                <strong>${Number(
                                  payment.amount,
                                ).toLocaleString()}</strong>
                                <span>${payment.currency}</span>
                            </div>
                        </div>
                        <div class="payment-details">
                            <div class="detail">
                                <span class="label">
                                    <i class="fa-regular fa-images"></i>
                                    Photos Selected
                                </span>
                                <span class="value">${photoCount} photo${photoCount !== 1 ? "s" : ""}</span>
                            </div>
                            <div class="detail">
                                <span class="label">
                                    <i class="fa-regular fa-calendar"></i>
                                    Submitted
                                </span>
                                <span class="value">${timeString}</span>
                            </div>
                            <div class="detail">
                                <span class="label">
                                    <i class="fa-solid fa-money-bill"></i>
                                    Method
                                </span>
                                <span class="value">${escapeHtml(
                                  payment.payment_method || "Bank Transfer",
                                )}</span>
                            </div>
                        </div>
                        <div class="payment-actions">
                            <button
                                class="approve-payment-btn"
                                data-payment-id="${payment.id}"
                                title="Confirm you received this payment"
                            >
                                <i class="fa-solid fa-check"></i>
                                Mark as Paid
                            </button>
                        </div>
                    </div>
                `;
      })
      .join("");
    document.querySelectorAll(".approve-payment-btn").forEach((button) => {
      button.addEventListener("click", () =>
        approvePayment(button.dataset.paymentId, button),
      );
    });
  } catch (error) {
    console.error("Could not load payments:", error);
    paymentsContainer.innerHTML = `
            <div class="error-state">
                <i class="fa-solid fa-exclamation-circle"></i>
                <p>Could not load payment requests.</p>
                <small>${error.message || "Please try again later."}</small>
            </div>
        `;
  }
}
async function approvePayment(paymentId, button) {
  if (!button) {
    button = document.querySelector(`[data-payment-id="${paymentId}"]`);
  }
  const confirmed = confirm(
    "⚠️  Before marking as paid, please confirm:\n\n✓ You verified the bank transfer\n✓ Amount matches the request\n✓ Payment is from the customer\n\nContinue?",
  );
  if (!confirmed) {
    return;
  }
  if (button) {
    button.disabled = true;
    button.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Confirming...
        `;
  }
  try {
    const { error } = await supabase
      .from("payments")
      .update({
        status: "paid",
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentId)
      .eq("status", "pending");
    if (error) {
      throw error;
    }
    alert("✅ Payment confirmed! Customer can now download their photos.");
    await loadPayments();
  } catch (error) {
    console.error("Payment approval error:", error);
    alert(
      "❌ Could not confirm this payment.\n\n" +
        (error.message || "Please try again later."),
    );
    if (button) {
      button.disabled = false;
      button.innerHTML = `
                <i class="fa-solid fa-check"></i>
                Mark as Paid
            `;
    }
  }
}
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
if (paymentsContainer) {
  loadPayments();
}

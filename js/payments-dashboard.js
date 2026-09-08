import { supabase } from "./supabaseClient.js";

const paymentsContainer =
    document.getElementById("paymentsContainer");

async function loadPayments() {
    try {
        const {
            data: { user },
            error: userError
        } = await supabase.auth.getUser();

        if (userError || !user) {
            window.location.href = "login.html";
            return;
        }

        const {
            data: payments,
            error
        } = await supabase
            .from("payments")
            .select(`
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
            `)
            .eq("status", "pending")
            .order("created_at", {
                ascending: false
            });

        if (error) {
            throw error;
        }

        if (!payments || payments.length === 0) {
            paymentsContainer.innerHTML = `
                <div class="empty-state">
                    <p>No pending payment requests.</p>
                </div>
            `;
            return;
        }

        paymentsContainer.innerHTML = payments
            .map((payment) => {
                const photoCount =
                    Array.isArray(payment.selected_photos)
                        ? payment.selected_photos.length
                        : 0;

                const createdAt =
                    new Date(
                        payment.created_at
                    ).toLocaleString();

                return `
                    <div class="payment-card">
                        <div class="payment-info">
                            <h3>
                                ${escapeHtml(
                                    payment.albums?.name ||
                                    "Unknown Album"
                                )}
                            </h3>

                            <p>
                                Amount:
                                <strong>
                                    ${Number(
                                        payment.amount
                                    ).toLocaleString()}
                                    ${payment.currency}
                                </strong>
                            </p>

                            <p>
                                Photos:
                                ${photoCount}
                            </p>

                            <p>
                                Method:
                                ${escapeHtml(
                                    payment.payment_method ||
                                    "Bank Transfer"
                                )}
                            </p>

                            <p>
                                Submitted:
                                ${escapeHtml(createdAt)}
                            </p>

                            <p>
                                Status:
                                <strong>
                                    ${escapeHtml(payment.status)}
                                </strong>
                            </p>
                        </div>

                        <div class="payment-actions">
                            <button
                                class="approve-payment-btn"
                                data-payment-id="${payment.id}"
                            >
                                Mark as Paid
                            </button>
                        </div>
                    </div>
                `;
            })
            .join("");

        document
            .querySelectorAll(".approve-payment-btn")
            .forEach((button) => {
                button.addEventListener(
                    "click",
                    () => approvePayment(button.dataset.paymentId)
                );
            });
    } catch (error) {
        console.error(
            "Could not load payments:",
            error
        );

        paymentsContainer.innerHTML = `
            <div class="empty-state">
                <p>
                    Could not load payment requests.
                </p>
            </div>
        `;
    }
}

async function approvePayment(paymentId) {
    const confirmed =
        confirm(
            "Have you verified this bank transfer and want to mark this payment as paid?"
        );

    if (!confirmed) {
        return;
    }

    try {
        const { error } = await supabase
            .from("payments")
            .update({
                status: "paid",
                updated_at: new Date().toISOString()
            })
            .eq("id", paymentId)
            .eq("status", "pending");

        if (error) {
            throw error;
        }

        alert("Payment marked as paid successfully.");

        await loadPayments();
    } catch (error) {
        console.error(
            "Payment approval error:",
            error
        );

        alert("Could not approve this payment.");
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

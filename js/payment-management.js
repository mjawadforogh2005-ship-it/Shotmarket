import { supabase } from "./supabaseClient.js";


document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "ShotMarket Payment Management Loaded 🚀"
        );


        const paymentsList =
            document.getElementById(
                "paymentsList"
            );


        /* =====================================================
           CHECK CURRENT USER
        ===================================================== */

        const {
            data: userData,
            error: userError
        } =
            await supabase.auth.getUser();


        if (userError || !userData?.user) {

            alert(
                "Please log in as a photographer."
            );

            window.location.href =
                "login.html";

            return;
        }


        const currentUser =
            userData.user;


        console.log(
            "Photographer:",
            currentUser.id
        );


        /* =====================================================
           LOAD PAYMENTS
        ===================================================== */

        await loadPayments();


        async function loadPayments() {

            try {

                /*
                 * Get payments belonging to albums
                 * owned by the current photographer.
                 *
                 * We load the payments first and then
                 * verify album ownership.
                 */

                const {
                    data: payments,
                    error
                } =
                    await supabase
                        .from("payments")
                        .select(`
                            *,
                            albums (
                                id,
                                name,
                                user_id,
                                event_date,
                                location
                            )
                        `)
                        .order(
                            "created_at",
                            {
                                ascending: false
                            }
                        );


                if (error) {

                    throw error;
                }


                /*
                 * Only show payments for albums
                 * belonging to this photographer.
                 */

                const photographerPayments =
                    (payments || []).filter(
                        payment =>
                            payment.albums &&
                            payment.albums.user_id ===
                            currentUser.id
                    );


                console.log(
                    "Photographer payments:",
                    photographerPayments
                );


                displayPayments(
                    photographerPayments
                );


            } catch (error) {

                console.error(
                    "Could not load payments:",
                    error
                );


                paymentsList.innerHTML = `

                    <div class="empty-payments">

                        <h3>
                            Could not load payments
                        </h3>

                        <p>
                            ${escapeHTML(
                                error.message
                            )}
                        </p>

                    </div>

                `;
            }
        }


        /* =====================================================
           DISPLAY PAYMENTS
        ===================================================== */

        function displayPayments(
            payments
        ) {

            if (!payments.length) {

                paymentsList.innerHTML = `

                    <div class="empty-payments">

                        <h3>
                            No payment requests
                        </h3>

                        <p>
                            Customer payment requests
                            will appear here.
                        </p>

                    </div>

                `;

                return;
            }


            paymentsList.innerHTML = "";


            payments.forEach(
                payment => {

                    const album =
                        payment.albums;


                    const item =
                        document.createElement(
                            "article"
                        );


                    item.className =
                        "payment-item";


                    const status =
                        payment.status ||
                        "pending";


                    item.innerHTML = `

                        <div class="payment-info">

                            <h3>
                                ${escapeHTML(
                                    album?.name ||
                                    "Untitled Album"
                                )}
                            </h3>

                            <p>
                                Payment ID:
                                ${escapeHTML(
                                    payment.id
                                )}
                            </p>

                            <div class="payment-meta">

                                <span>
                                    ${formatNumber(
                                        payment.amount
                                    )}
                                    ${escapeHTML(
                                        payment.currency ||
                                        "KZT"
                                    )}
                                </span>

                                <span>
                                    ${escapeHTML(
                                        payment.payment_method ||
                                        "Bank Transfer"
                                    )}
                                </span>

                                <span>
                                    ${formatDateTime(
                                        payment.created_at
                                    )}
                                </span>

                                <span class="status ${escapeHTML(
                                    status
                                )}">
                                    ${escapeHTML(
                                        status.toUpperCase()
                                    )}
                                </span>

                            </div>

                        </div>


                        <div class="payment-actions">

                            ${
                                status === "pending"
                                    ? `

                                        <button
                                            type="button"
                                            class="confirm-btn"
                                            data-payment-id="${escapeHTML(
                                                payment.id
                                            )}"
                                        >
                                            Confirm Payment
                                        </button>

                                        <button
                                            type="button"
                                            class="reject-btn"
                                            data-payment-id="${escapeHTML(
                                                payment.id
                                            )}"
                                        >
                                            Reject
                                        </button>

                                    `
                                    : `

                                        <span>
                                            ${
                                                status === "paid"
                                                    ? "✓ Payment Confirmed"
                                                    : "Payment Rejected"
                                            }
                                        </span>

                                    `
                            }

                        </div>

                    `;


                    paymentsList.appendChild(
                        item
                    );
                }
            );


            attachPaymentActions();
        }


        /* =====================================================
           BUTTON EVENTS
        ===================================================== */

        function attachPaymentActions() {

            const confirmButtons =
                document.querySelectorAll(
                    ".confirm-btn"
                );


            confirmButtons.forEach(
                button => {

                    button.addEventListener(
                        "click",
                        async function () {

                            const paymentId =
                                this.dataset.paymentId;


                            await updatePaymentStatus(
                                paymentId,
                                "paid",
                                this
                            );

                        }
                    );
                }
            );


            const rejectButtons =
                document.querySelectorAll(
                    ".reject-btn"
                );


            rejectButtons.forEach(
                button => {

                    button.addEventListener(
                        "click",
                        async function () {

                            const paymentId =
                                this.dataset.paymentId;


                            const confirmed =
                                confirm(
                                    "Are you sure you want to reject this payment?"
                                );


                            if (!confirmed) {
                                return;
                            }


                            await updatePaymentStatus(
                                paymentId,
                                "rejected",
                                this
                            );

                        }
                    );
                }
            );
        }


        /* =====================================================
           UPDATE PAYMENT STATUS
        ===================================================== */

        async function updatePaymentStatus(
            paymentId,
            newStatus,
            button
        ) {

            button.disabled =
                true;


            try {

                const {
                    data,
                    error
                } =
                    await supabase
                        .from("payments")
                        .update({
                            status:
                                newStatus,

                            updated_at:
                                new Date().toISOString()
                        })
                        .eq(
                            "id",
                            paymentId
                        )
                        .select()
                        .single();


                if (error) {

                    throw error;
                }


                console.log(
                    "Payment updated:",
                    data
                );


                alert(
                    newStatus === "paid"
                        ? "Payment confirmed successfully."
                        : "Payment rejected."
                );


                await loadPayments();


            } catch (error) {

                console.error(
                    "Payment update failed:",
                    error
                );


                alert(
                    "Could not update payment.\n\n" +
                    error.message
                );


                button.disabled =
                    false;
            }
        }


        /* =====================================================
           HELPERS
        ===================================================== */

        function formatNumber(
            number
        ) {

            return Number(
                number || 0
            ).toLocaleString(
                "en-US"
            );
        }


        function formatDateTime(
            dateString
        ) {

            if (!dateString) {
                return "—";
            }


            const date =
                new Date(
                    dateString
                );


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return dateString;
            }


            return date.toLocaleString(
                "en-US"
            );
        }


        function escapeHTML(
            value
        ) {

            return String(
                value ?? ""
            )
                .replace(
                    /&/g,
                    "&amp;"
                )
                .replace(
                    /</g,
                    "&lt;"
                )
                .replace(
                    />/g,
                    "&gt;"
                )
                .replace(
                    /"/g,
                    "&quot;"
                )
                .replace(
                    /'/g,
                    "&#039;"
                );
        }

    }
);
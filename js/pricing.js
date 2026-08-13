/* =========================================================
   SHOTMARKET
   PRICING PAGE JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const billingToggle =
        document.getElementById("billingToggle");

    const monthlyLabel =
        document.getElementById("monthlyLabel");

    const yearlyLabel =
        document.getElementById("yearlyLabel");

    const prices =
        document.querySelectorAll(".price");

    const periods =
        document.querySelectorAll(".period");


    let yearly = false;


    /* =====================================================
       UPDATE PRICES
    ===================================================== */

    function updatePrices() {

        prices.forEach(price => {

            const monthly =
                price.dataset.monthly;

            const yearlyPrice =
                price.dataset.yearly;


            if (yearly) {

                price.textContent =
                    yearlyPrice;

            } else {

                price.textContent =
                    monthly;

            }

        });


        periods.forEach(period => {

            if (yearly) {

                period.textContent =
                    "/ month, billed yearly";

            } else {

                period.textContent =
                    "/ month";

            }

        });

    }


    /* =====================================================
       TOGGLE BILLING
    ===================================================== */

    billingToggle.addEventListener(
        "click",
        () => {

            yearly = !yearly;


            billingToggle.classList.toggle(
                "yearly",
                yearly
            );


            monthlyLabel.classList.toggle(
                "active",
                !yearly
            );


            yearlyLabel.classList.toggle(
                "active",
                yearly
            );


            updatePrices();

        }
    );


    /* =====================================================
       INITIAL STATE
    ===================================================== */

    updatePrices();

});
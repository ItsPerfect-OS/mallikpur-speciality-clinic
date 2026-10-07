const SUPABASE_URL = "https://jdlpytqauxoldhcszxpy.supabase.co";
const SUPABASE_KEY = "sb_publishable_8wbMkDf3yS80rt9xVj5FBQ_wvLdhv1A";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const form = document.getElementById("appointment-form");
const formMessage = document.getElementById("form-message");

if (form) {
    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const speciality = document.getElementById("speciality").value;
        const appointmentDate =
            document.getElementById("appointment-date").value;
        const appointmentTime =
            document.getElementById("appointment-time").value;
        const message =
            document.getElementById("message").value.trim();

        if (!name || !phone || !appointmentDate || !appointmentTime) {
            formMessage.textContent =
                "Please fill in all required fields.";
            return;
        }

        formMessage.textContent =
            "Sending your appointment request...";

        const { error } = await supabaseClient
            .from("appointments")
            .insert([
                {
                    name,
                    phone,
                    speciality,
                    message,
                    appointment_date: appointmentDate,
                    appointment_time: appointmentTime,
                    status: "Pending"
                }
            ]);

        if (error) {
            console.error("Supabase error:", error);

            formMessage.textContent =
                "Could not send appointment: " + error.message;

            return;
        }

        formMessage.textContent =
            `Thank you, ${name}. Your appointment request has been received!`;

        form.reset();
    });
}
console.log("Mallikpur Admin JS loaded!");


// ========================================
// SUPABASE
// ========================================

const SUPABASE_URL = "https://jdlpytqauxoldhcszxpy.supabase.co";
const SUPABASE_KEY = "sb_publishable_8wbMkDf3yS80rt9xVj5FBQ_wvLdhv1A";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ========================================
// DASHBOARD ELEMENTS
// ========================================

const totalAppointments =
    document.getElementById("total-appointments");

const pendingAppointments =
    document.getElementById("pending-appointments");

const confirmedAppointments =
    document.getElementById("confirmed-appointments");

const cancelledAppointments =
    document.getElementById("cancelled-appointments");

const appointmentsList =
    document.getElementById("appointments-list");

const emptyState =
    document.getElementById("empty-state");

const tableContainer =
    document.getElementById("appointment-table-container");

const refreshButton =
    document.getElementById("refresh-button");


// ========================================
// APPOINTMENT DETAILS MODAL
// ========================================

const detailsModal =
    document.getElementById("details-modal");

const closeDetailsModal =
    document.getElementById("close-details-modal");

const detailsName =
    document.getElementById("details-name");

const detailsPhone =
    document.getElementById("details-phone");

const detailsSpeciality =
    document.getElementById("details-speciality");

const detailsDate =
    document.getElementById("details-date");

const detailsTime =
    document.getElementById("details-time");

const detailsStatus =
    document.getElementById("details-status");

const detailsMessage =
    document.getElementById("details-message");

const detailsConfirm =
    document.getElementById("details-confirm");

const detailsCancel =
    document.getElementById("details-cancel");

const detailsDelete =
    document.getElementById("details-delete");

let currentAppointmentId = null;


// ========================================
// NEW APPOINTMENT MODAL
// ========================================

const appointmentModal =
    document.getElementById("appointment-modal");

const newAppointmentButton =
    document.getElementById("new-appointment-button");

const closeModal =
    document.getElementById("close-modal");

const adminAppointmentForm =
    document.getElementById("admin-appointment-form");


// ========================================
// LOAD APPOINTMENTS
// ========================================

async function loadAppointments() {

    console.log("Loading appointments...");

    appointmentsList.innerHTML = "";

    const { data, error } = await supabaseClient
        .from("appointments")
        .select("*")
        .order("appointment_date", {
            ascending: true
        })
        .order("appointment_time", {
            ascending: true
        });

    if (error) {

        console.error(
            "SUPABASE ERROR:",
            error
        );

        appointmentsList.innerHTML = `
            <tr>
                <td colspan="6">
                    Error loading appointments:
                    ${escapeHTML(error.message)}
                </td>
            </tr>
        `;

        emptyState.style.display = "none";

        tableContainer.classList.remove("hidden");
        tableContainer.style.display = "block";

        return;
    }

    console.log(
        "APPOINTMENTS FOUND:",
        data
    );

    updateStats(data);

    displayAppointments(data);
}


// ========================================
// UPDATE STATS
// ========================================

function updateStats(appointments) {

    totalAppointments.textContent =
        appointments.length;

    pendingAppointments.textContent =
        appointments.filter(
            appointment =>
                appointment.status === "Pending"
        ).length;

    confirmedAppointments.textContent =
        appointments.filter(
            appointment =>
                appointment.status === "Confirmed"
        ).length;

    cancelledAppointments.textContent =
        appointments.filter(
            appointment =>
                appointment.status === "Cancelled"
        ).length;
}


// ========================================
// DISPLAY APPOINTMENTS
// ========================================

function displayAppointments(appointments) {

    appointmentsList.innerHTML = "";

    if (
        !appointments ||
        appointments.length === 0
    ) {

        emptyState.style.display = "block";

        tableContainer.classList.add("hidden");
        tableContainer.style.display = "none";

        return;
    }

    emptyState.style.display = "none";

    tableContainer.classList.remove("hidden");
    tableContainer.style.display = "block";


    appointments.forEach(
        appointment => {

            const row =
                document.createElement("tr");


            // ------------------------------
            // ACTION BUTTONS
            // ------------------------------

            let actions = `
                <button
                    class="action-button"
                    onclick="viewAppointment(${appointment.id})"
                >
                    👁 View
                </button>
            `;


            if (
                appointment.status === "Pending"
            ) {

                actions += `
                    <button
                        class="action-button confirm-button"
                        onclick="confirmAppointment(${appointment.id})"
                    >
                        ✓ Confirm
                    </button>

                    <button
                        class="action-button cancel-button"
                        onclick="cancelAppointment(${appointment.id})"
                    >
                        ✕ Cancel
                    </button>
                `;
            }


            actions += `
                <button
                    class="action-button delete-button"
                    onclick="deleteAppointment(${appointment.id})"
                >
                    🗑
                </button>
            `;


            // ------------------------------
            // TABLE ROW
            // ------------------------------

            row.innerHTML = `

                <td>
                    <strong>
                        ${escapeHTML(
                            appointment.name
                        )}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(
                        appointment.phone
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        appointment.speciality
                    )}
                </td>

                <td>
                    ${formatDate(
                        appointment.appointment_date
                    )}

                    <br>

                    <small>
                        ${formatTime(
                            appointment.appointment_time
                        )}
                    </small>
                </td>

                <td>
                    <span
                        class="status ${appointment.status.toLowerCase()}"
                    >
                        ${escapeHTML(
                            appointment.status
                        )}
                    </span>
                </td>

                <td class="action-cell">
                    ${actions}
                </td>

            `;

            appointmentsList.appendChild(row);
        }
    );
}


// ========================================
// VIEW APPOINTMENT
// ========================================

window.viewAppointment = async function(id) {

    console.log(
        "Opening appointment:",
        id
    );

    const { data, error } =
        await supabaseClient
            .from("appointments")
            .select("*")
            .eq("id", id)
            .single();


    if (error) {

        console.error(
            "VIEW ERROR:",
            error
        );

        alert(
            "Could not load appointment:\n" +
            error.message
        );

        return;
    }


    currentAppointmentId =
        data.id;


    detailsName.textContent =
        data.name || "Unknown patient";

    detailsPhone.textContent =
        data.phone || "—";

    detailsSpeciality.textContent =
        data.speciality || "—";

    detailsDate.textContent =
        formatDate(
            data.appointment_date
        );

    detailsTime.textContent =
        formatTime(
            data.appointment_time
        );

    detailsStatus.textContent =
        data.status || "—";

    detailsMessage.textContent =
        data.message ||
        "No concern provided.";


    // ------------------------------
    // Pending buttons
    // ------------------------------

    if (
        data.status === "Pending"
    ) {

        detailsConfirm.style.display =
            "inline-block";

        detailsCancel.style.display =
            "inline-block";

    } else {

        detailsConfirm.style.display =
            "none";

        detailsCancel.style.display =
            "none";
    }


    // ------------------------------
    // Show modal
    // ------------------------------

    detailsModal.classList.remove(
        "hidden"
    );

    detailsModal.style.display =
        "flex";
};


// ========================================
// CLOSE DETAILS MODAL
// ========================================

if (closeDetailsModal) {

    closeDetailsModal.addEventListener(
        "click",
        function() {

            detailsModal.classList.add(
                "hidden"
            );

            detailsModal.style.display =
                "none";

        }
    );
}


if (detailsModal) {

    detailsModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target === detailsModal
            ) {

                detailsModal.classList.add(
                    "hidden"
                );

                detailsModal.style.display =
                    "none";
            }

        }
    );
}


// ========================================
// CONFIRM APPOINTMENT
// ========================================

window.confirmAppointment = async function(id) {

    const confirmed =
        confirm(
            "Confirm this appointment?"
        );

    if (!confirmed) {
        return false;
    }


    console.log(
        "Confirming appointment:",
        id
    );


    const { error } =
        await supabaseClient
            .from("appointments")
            .update({
                status: "Confirmed"
            })
            .eq("id", id);


    if (error) {

        console.error(
            "CONFIRM ERROR:",
            error
        );

        alert(
            "Could not confirm appointment:\n" +
            error.message
        );

        return false;
    }


    console.log(
        "Appointment confirmed!"
    );


    await loadAppointments();

    return true;
};


// ========================================
// CANCEL APPOINTMENT
// ========================================

window.cancelAppointment = async function(id) {

    const confirmed =
        confirm(
            "Cancel this appointment?"
        );

    if (!confirmed) {
        return false;
    }


    console.log(
        "Cancelling appointment:",
        id
    );


    const { error } =
        await supabaseClient
            .from("appointments")
            .update({
                status: "Cancelled"
            })
            .eq("id", id);


    if (error) {

        console.error(
            "CANCEL ERROR:",
            error
        );

        alert(
            "Could not cancel appointment:\n" +
            error.message
        );

        return false;
    }


    console.log(
        "Appointment cancelled!"
    );


    await loadAppointments();

    return true;
};


// ========================================
// DELETE APPOINTMENT
// ========================================

window.deleteAppointment = async function(id) {

    const confirmed =
        confirm(
            "DELETE this appointment permanently?\n\n" +
            "This cannot be undone."
        );

    if (!confirmed) {
        return false;
    }


    console.log(
        "Deleting appointment:",
        id
    );


    const { error } =
        await supabaseClient
            .from("appointments")
            .delete()
            .eq("id", id);


    if (error) {

        console.error(
            "DELETE ERROR:",
            error
        );

        alert(
            "Could not delete appointment:\n" +
            error.message
        );

        return false;
    }


    console.log(
        "Appointment deleted!"
    );


    await loadAppointments();

    return true;
};


// ========================================
// DETAILS CONFIRM BUTTON
// ========================================

if (detailsConfirm) {

    detailsConfirm.addEventListener(
        "click",
        async function() {

            if (
                !currentAppointmentId
            ) {
                return;
            }


            const success =
                await confirmAppointment(
                    currentAppointmentId
                );


            if (success) {

                detailsModal.classList.add(
                    "hidden"
                );

                detailsModal.style.display =
                    "none";
            }

        }
    );
}


// ========================================
// DETAILS CANCEL BUTTON
// ========================================

if (detailsCancel) {

    detailsCancel.addEventListener(
        "click",
        async function() {

            if (
                !currentAppointmentId
            ) {
                return;
            }


            const success =
                await cancelAppointment(
                    currentAppointmentId
                );


            if (success) {

                detailsModal.classList.add(
                    "hidden"
                );

                detailsModal.style.display =
                    "none";
            }

        }
    );
}


// ========================================
// DETAILS DELETE BUTTON
// ========================================

if (detailsDelete) {

    detailsDelete.addEventListener(
        "click",
        async function() {

            if (
                !currentAppointmentId
            ) {
                return;
            }


            const success =
                await deleteAppointment(
                    currentAppointmentId
                );


            if (success) {

                detailsModal.classList.add(
                    "hidden"
                );

                detailsModal.style.display =
                    "none";
            }

        }
    );
}


// ========================================
// NEW APPOINTMENT MODAL
// ========================================

if (newAppointmentButton) {

    newAppointmentButton.addEventListener(
        "click",
        function() {

            appointmentModal.classList.remove(
                "hidden"
            );

            appointmentModal.style.display =
                "flex";
        }
    );
}


// ========================================
// CLOSE NEW APPOINTMENT MODAL
// ========================================

if (closeModal) {

    closeModal.addEventListener(
        "click",
        function() {

            appointmentModal.classList.add(
                "hidden"
            );

            appointmentModal.style.display =
                "none";
        }
    );
}


if (appointmentModal) {

    appointmentModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target === appointmentModal
            ) {

                appointmentModal.classList.add(
                    "hidden"
                );

                appointmentModal.style.display =
                    "none";
            }

        }
    );
}


// ========================================
// CREATE MANUAL APPOINTMENT
// ========================================

if (adminAppointmentForm) {

    adminAppointmentForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const name =
                document
                    .getElementById("admin-name")
                    .value
                    .trim();

            const phone =
                document
                    .getElementById("admin-phone")
                    .value
                    .trim();

            const speciality =
                document
                    .getElementById(
                        "admin-speciality"
                    )
                    .value;

            const date =
                document
                    .getElementById("admin-date")
                    .value;

            const time =
                document
                    .getElementById("admin-time")
                    .value;


            if (
                !name ||
                !phone ||
                !date ||
                !time
            ) {

                alert(
                    "Please fill in all required fields."
                );

                return;
            }


            console.log(
                "Creating appointment..."
            );


            const { error } =
                await supabaseClient
                    .from("appointments")
                    .insert([
                        {
                            name: name,
                            phone: phone,
                            speciality: speciality,
                            message: null,
                            appointment_date: date,
                            appointment_time: time,
                            status: "Confirmed"
                        }
                    ]);


            if (error) {

                console.error(
                    "CREATE APPOINTMENT ERROR:",
                    error
                );

                alert(
                    "Could not create appointment:\n" +
                    error.message
                );

                return;
            }


            console.log(
                "Appointment created!"
            );


            alert(
                "Appointment created successfully!"
            );


            adminAppointmentForm.reset();


            appointmentModal.classList.add(
                "hidden"
            );

            appointmentModal.style.display =
                "none";


            await loadAppointments();
        }
    );
}


// ========================================
// REFRESH
// ========================================

if (refreshButton) {

    refreshButton.addEventListener(
        "click",
        loadAppointments
    );
}


// ========================================
// DATE FORMAT
// ========================================

function formatDate(date) {

    if (!date) {
        return "—";
    }


    const parts =
        date.split("-");


    if (
        parts.length !== 3
    ) {
        return date;
    }


    return (
        `${parts[2]}/` +
        `${parts[1]}/` +
        `${parts[0]}`
    );
}


// ========================================
// TIME FORMAT
// ========================================

function formatTime(time) {

    if (!time) {
        return "—";
    }


    const parts =
        time.split(":");


    if (
        parts.length < 2
    ) {
        return time;
    }


    let hour =
        parseInt(parts[0]);

    const minute =
        parts[1];


    const period =
        hour >= 12
            ? "PM"
            : "AM";


    hour =
        hour % 12;


    if (hour === 0) {
        hour = 12;
    }


    return (
        `${hour}:${minute} ${period}`
    );
}


// ========================================
// HTML ESCAPING
// ========================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


// ========================================
// START DASHBOARD
// ========================================

loadAppointments();
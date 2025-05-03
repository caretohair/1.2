import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCeuaUdUQO3TEJplfl5q24O8Zb01Rwtw6E",
    authDomain: "hcaw-af26e.firebaseapp.com",
    projectId: "hcaw-af26e",
    storageBucket: "hcaw-af26e.firebasestorage.app",
    messagingSenderId: "882275854718",
    appId: "1:882275854718:web:135016785a06cd1b6feb2f",
    measurementId: "G-8Z07DLMR0E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/userinfo.email');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');

// Authentication handling
const googleSignInBtn = document.getElementById('googleSignInBtn');
const signOutBtn = document.getElementById('signOutBtn');
const userStatus = document.getElementById('userStatus');
const bookingForm = document.getElementById('booking-form');
const emailInput = document.getElementById('email');

if (!googleSignInBtn || !signOutBtn || !userStatus || !bookingForm || !emailInput) {
    console.error("One or more DOM elements not found:", { googleSignInBtn, signOutBtn, userStatus, bookingForm, emailInput });
}

googleSignInBtn.addEventListener('click', () => {
    console.log("Attempting to sign in with Google...");
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            console.log("Signed in with Google:", user);
            console.log("User email:", user.email);
            console.log("User displayName:", user.displayName);
        })
        .catch((error) => {
            console.error("Google Sign-In error:", error.code, error.message);
            alert('Error signing in with Google: ' + error.message);
        });
});

signOutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        console.log("Signed out successfully");
    }).catch((error) => {
        console.error("Sign-out error:", error);
    });
});

onAuthStateChanged(auth, (user) => {
    console.log("Auth state changed:", user);
    if (user) {
        const displayName = user.email || user.displayName || "User";
        userStatus.textContent = `Signed in as ${displayName}`;
        googleSignInBtn.style.display = 'none';
        signOutBtn.style.display = 'block';
        bookingForm.style.display = 'block';
        emailInput.value = user.email || "Not provided";
    } else {
        userStatus.textContent = 'Not signed in';
        googleSignInBtn.style.display = 'block';
        signOutBtn.style.display = 'none';
        bookingForm.style.display = 'none';
        emailInput.value = '';
    }
});

const dateInput = document.getElementById('appointmentDate');
const timeSlot = document.getElementById('time-slot');
const timeInput = document.getElementById('appointmentTime');

// Function to get current time in IST (UTC+5:30)
function getCurrentTimeInIST() {
    const now = new Date();
    const offsetIST = 5.5 * 60; // IST is UTC+5:30 (5.5 hours ahead of UTC)
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    return new Date(utc + (offsetIST * 60 * 1000));
}

// Get today's date in YYYY-MM-DD format in IST
const nowIST = getCurrentTimeInIST();
const today = nowIST.toISOString().split('T')[0];

// Calculate max date (6 months from today)
const maxDate = new Date(nowIST);
maxDate.setMonth(nowIST.getMonth() + 6);
const maxDateStr = maxDate.toISOString().split('T')[0];

// Set min and max dates for the date input
dateInput.min = today;
dateInput.max = maxDateStr;

// Function to update time slots based on selected date
function updateTimeSlots() {
    const selectedDate = dateInput.value;
    const now = getCurrentTimeInIST();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();

    console.log("Selected date:", selectedDate);
    console.log("Today:", today);

    // If a date is selected, update time slots
    if (selectedDate && selectedDate >= today) {
        console.log("Date is valid, updating time slots...");

        // Calculate the earliest allowed hour (at least 1 hour from now, rounded to the next slot)
        let earliestHour = currentHour + 1;
        if (currentMinutes > 0) {
            earliestHour += 1; // Round up to the next hour if there are any minutes
        }
        if (earliestHour > 23) {
            earliestHour = 6; // If past 11:00 PM, start at 6:00 AM the next day
            const nextDay = new Date(nowIST);
            nextDay.setDate(nowIST.getDate() + 1);
            dateInput.min = nextDay.toISOString().split('T')[0];
        }

        // Show time slots and update them
        timeSlot.style.display = 'block';
        console.log("Time slot display set to block");

        const timeOptions = timeInput.options;
        for (let i = 0; i < timeOptions.length; i++) {
            const option = timeOptions[i];
            const optionValue = option.value;
            if (!optionValue) continue; // Skip "Choose a time" option
            const optionHour = parseInt(optionValue.split(':')[0]);

            if (selectedDate === today && optionHour < earliestHour) {
                option.disabled = true;
            } else {
                option.disabled = false;
            }
        }
        timeOptions[0].disabled = false; // Ensure "Choose a time" is enabled
    } else {
        timeSlot.style.display = 'none';
        console.log("No valid date selected, hiding time slots");
    }

    return selectedDate;
}

// Handle date input change
dateInput.addEventListener('change', () => {
    console.log("Date selected:", dateInput.value);
    updateTimeSlots();
});

// Initial update
updateTimeSlots();

// Handle form submission with validation
document.getElementById('booking-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
        alert('Please sign in to book an appointment.');
        return;
    }

    const phoneNumber = document.getElementById('phone').value;
    // Validate phone number: must be exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    console.log("Phone number entered:", phoneNumber);
    if (!phoneRegex.test(phoneNumber)) {
        alert('Phone number must be exactly 10 digits with no other characters.');
        return;
    }

    const address = document.getElementById('address').value;
    // Validate address: must be at least 30 characters
    console.log("Address entered:", address, "Length:", address.length);
    if (address.length < 30) {
        alert('Address must be at least 30 characters long.');
        return;
    }

    const selectedDate = dateInput.value;
    const selectedTime = timeInput.value;

    // Validate that the selected date and time are at least 1 hour in the future (in IST)
    const now = getCurrentTimeInIST();
    const selectedDateTime = new Date(`${selectedDate}T${selectedTime}:00+05:30`); // Force IST timezone
    const minAllowedTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

    console.log("Current time (IST):", now.toISOString());
    console.log("Selected date/time (IST):", selectedDateTime.toISOString());
    console.log("Minimum allowed time (IST):", minAllowedTime.toISOString());

    if (selectedDateTime <= minAllowedTime) {
        alert('Booking must be at least 1 hour from the current time. Please select a later time.');
        return;
    }

    const appointmentData = {
        name: document.getElementById('name').value,
        address: address,
        phone: phoneNumber,
        email: user.email || "Not provided",
        service: document.getElementById('service').value,
        date: selectedDate,
        time: selectedTime,
        timestamp: new Date(),
        userId: user.uid
    };

    try {
        console.log("Submitting appointment:", appointmentData);
        await addDoc(collection(db, 'appointments'), appointmentData);
        alert('Appointment booked successfully!');
        document.getElementById('booking-form').reset();
        timeSlot.style.display = 'none';
        emailInput.value = user.email || "Not provided";
        updateTimeSlots(); // Reset time slots after submission
    } catch (error) {
        console.error("Submission error:", error);
        alert('Error booking appointment: ' + error.message);
    }
});

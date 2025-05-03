// Function to create a UPI payment intent URL
function createUpiIntentUrl(pa, pn, amount) {
    return `upi://pay?pa=${encodeURIComponent(pa)}&pn=${encodeURIComponent(pn)}&am=${amount}&cu=INR`;
}

// Function to handle redirection with a fallback
function redirectToPayment(intentUrl, fallbackUrl) {
    // Attempt to open the app using the intent URL
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = intentUrl;
    document.body.appendChild(iframe);

    // Fallback to web-based payment if the app doesn't open after 2 seconds
    setTimeout(() => {
        window.location.href = fallbackUrl;
    }, 2000);
}

// Google Pay button handler
document.getElementById('gpayBtn').addEventListener('click', () => {
    const gpayIntent = createUpiIntentUrl('9498096001@upi', 'CareToHair Services', '100'); // Replace '100' with dynamic amount if needed
    const gpayFallback = 'https://pay.google.com'; // Fallback URL if Google Pay app is not installed
    redirectToPayment(gpayIntent, gpayFallback);
});

// PhonePe button handler
document.getElementById('phonepeBtn').addEventListener('click', () => {
    const phonepeIntent = createUpiIntentUrl('9498096001@upi', 'CareToHair Services', '100'); // Replace '100' with dynamic amount if needed
    const phonepeFallback = 'https://www.phonepe.com'; // Fallback URL if PhonePe app is not installed
    redirectToPayment(phonepeIntent, phonepeFallback);
});

// Error handling for failed attempts
window.addEventListener('error', (event) => {
    console.error('Payment initiation failed:', event);
    alert('Failed to initiate payment. Please try again or use another payment method.');
});

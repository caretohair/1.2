document.getElementById('gpayBtn').addEventListener('click', () => {
    const gpayLink = 'gpay://upi/pay?pa=9498096001@upi&pn=CareToHair%20Services&cu=INR';
    window.location.href = gpayLink;
});

document.getElementById('phonepeBtn').addEventListener('click', () => {
    const phonepeLink = 'phonepe://pay?pa=9498096001@upi&pn=CareToHair%20Services&cu=INR';
    window.location.href = phonepeLink;
});

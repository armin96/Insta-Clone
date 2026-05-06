async function testLogin() {
    try {
        console.log('Testing login with john@example.com...');
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'john@example.com',
                password: 'password123'
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Login successful!');
            console.log('User:', data.user.username);
        } else {
            console.error('Login failed!');
            console.error('Status:', response.status);
            console.error('Message:', data.message);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testLogin();

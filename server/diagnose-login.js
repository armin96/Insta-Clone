async function diagnose() {
    const credentials = {
        email: 'john@example.com',
        password: 'password123'
    };

    console.log('--- Network Diagnostics ---');
    const targets = ['http://localhost:5000', 'http://127.0.0.1:5000'];

    for (const url of targets) {
        try {
            console.log(`Checking ${url}/api/auth/login ...`);
            const res = await fetch(`${url}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            const data = await res.json();
            console.log(`Response from ${url}:`, res.status, data.message || 'Success');
        } catch (err) {
            console.log(`Error connecting to ${url}:`, err.message);
        }
    }
}

diagnose();

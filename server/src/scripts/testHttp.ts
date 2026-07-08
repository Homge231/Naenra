import fetch from 'node-fetch'

async function testFlow() {
  const email = 'test_http_' + Date.now() + '@example.com'
  console.log('Registering email:', email)

  // 1. Register
  const regRes = await fetch('http://localhost:3000/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'password123',
      username: 'test_http'
    })
  })
  const regData = await regRes.json()
  console.log('Register Response:', regData)

  if (!regRes.ok) return

  // 2. We need the OTP. Since it's printed to console in mailer.ts, 
  // or we can just read it from the pendingRegistrations if we had access.
  // Wait, I can't read the OTP from outside. I'll modify the server to return it for testing.
}

testFlow().catch(console.error)

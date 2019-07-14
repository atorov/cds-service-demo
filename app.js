const http = require('http')

const server = http.createServer((req, res) => {
  const url = req.url
  const method = req.method

  if (url === '/health') {
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.writeHead(200)
    return res.end(JSON.stringify({ status: 'OK' }))
  }

  if (url === '/cds-services') {
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.writeHead(200)
    return res.end(JSON.stringify({
      services: [
        {
          hook: 'patient-view',
          title: 'Static CDS Service Example',
          description: 'An example of a CDS Service that returns a static set of cards',
          id: 'static-patient-greeter',
          prefetch: {
            patientToGreet: 'Patient/{{Patient.id}}'
          }
        }
      ]
    }))
  }

  if (url === '/cds-services/static-patient-greeter' && method === 'POST') {
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.writeHead(200)
    return res.end(JSON.stringify({
      cards: [
        {
          summary: 'Info Card',
          indicator: 'info',
          detail: 'This is an example info card'
        }
      ]
    }))
  }

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.writeHead(404)
  return res.end(JSON.stringify({ status: 'Not found' }))
  // res.writeHead(200)
  // return res.end()
})

const port = process.env.PORT || 3000
console.log('::: port:', port)

server.listen(port)

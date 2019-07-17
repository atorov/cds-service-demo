const http = require('http')
const moment = require('moment')

function processPost(req, cb) {
  let body = ''
  req.on('data', (data) => {
    body += data
    if (body.length > 1e6) {
      body = ''
      req.connection.destroy()
    }
  })

  req.on('end', () => {
    let post = null
    if (body) {
      try {
        post = JSON.parse(body)
      } catch (reason) {
        console.log('::: reason:', reason)
      }
    }
    req.post = post
    cb()
  })
}

const server = http.createServer((req, res) => {
  const url = req.url
  const method = req.method

  // GET / ---------------------------------------------------------------------
  if (url == '/' && method == 'GET') {
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.writeHead(200)
    return res.end(JSON.stringify({ status: 'OK' }))
  }

  // OPTIONS, GET /cds-services ------------------------------------------------
  if (url == '/cds-services' && ['OPTIONS', 'GET'].includes(method.toUpperCase())) {
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.writeHead(200)
    return res.end(JSON.stringify({
      services: [
        {
          hook: 'patient-view',
          title: 'Info card on patient view',
          description: 'An example of a CDS Service that returns an info card',
          id: 'info-card'
        },
        {
          hook: 'patient-view',
          title: 'Card on patient view with patient age',
          description: 'An example of a CDS Service that returns a card containing the patient age. The card could be of type `info`, `warning` or `critical` and it depends on the patient age.',
          id: 'card-age',
          prefetch: {
            patient: 'Patient/{{context.patientId}}'
          }
        }
      ]
    }))
  }

  // OPTIONS, GET /cds-services/info-card --------------------------------------
  if (url === '/cds-services/info-card' && ['OPTIONS', 'POST'].includes(method)) {
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.writeHead(200)

    return res.end(JSON.stringify({
      cards: [
        {
          summary: 'Info card on patient view',
          indicator: 'info',
          detail: '# Details\n\nThis is a simple info card',
          source: {
            label: 'CDS Service Demo',
            url: 'https://example.com/source'
          }
        }
      ]
    }))
  }

  // OPTIONS, GET /cds-services/card-age ---------------------------------------
  if (url == '/cds-services/card-age' && ['OPTIONS', 'POST'].includes(method.toUpperCase())) {
    return processPost(req, () => {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Access-Control-Allow-Credentials', 'true')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST')
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.writeHead(200)

      const hook = req.post && req.post.hook
      const birthDate = req.post && req.post.prefetch && req.post.prefetch.patient && req.post.prefetch.patient.birthDate
      const cards = []
      if (hook === 'patient-view') {
        const age = moment(birthDate).isValid() ? moment().diff(birthDate, 'years') : null
        const detail = age !== null ? `# Details\n\nThe patient age is: ${age}` : `# Details\n\nInvalid date of birth`
        let indicator = 'info'
        if (age < 10) {
          indicator = 'warning'
        } else if (age > 80) {
          indicator = 'critical'
        }

        cards.push({
          summary: 'Card on patient view with patient age',
          indicator,
          detail,
          source: {
            label: 'CDS Service Demo',
            url: 'https://example.com/source'
          }
        })
      }

      return res.end(JSON.stringify({ cards }))
    })
  }

  // 404 -----------------------------------------------------------------------
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.writeHead(404)
  return res.end(JSON.stringify({ status: 'Not found' }))
})

const port = process.env.PORT || 3000
console.log('::: port:', port)

server.listen(port)

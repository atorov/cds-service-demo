const http = require('http')
const moment = require('moment')
const uuidv4 = require('uuid/v4')

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

function setServiceCommonHeaders(res) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST')
  res.setHeader('Access-Control-Allow-Origin', '*')
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
    setServiceCommonHeaders(res)
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET')
    res.writeHead(200)

    return res.end(JSON.stringify({
      services: [
        {
          id: 'card-age-fhir-request',
          hook: 'patient-view',
          title: 'Card on patient view with patient age',
          description: 'An example of a CDS Service that returns a card containing the patient age. The card could be of type `info`, `warning` or `critical` and it depends on the patient age. The information about the patient is retrieved by the service itself.'
        },
        {
          id: 'card-age-prefetch',
          hook: 'patient-view',
          title: 'Card on patient view with patient age',
          description: 'An example of a CDS Service that returns a card containing the patient age. The card could be of type `info`, `warning` or `critical` and it depends on the patient age. The information about the patient is provided by the CDS Client in `prefetch` property.',
          prefetch: {
            patient: 'Patient/{{context.patientId}}'
          }
        },
        {
          id: 'critical-card',
          hook: 'patient-view',
          title: 'Critical card on patient view',
          description: 'An example of a CDS Service that returns a critical card'
        },
        {
          id: 'info-card',
          hook: 'patient-view',
          title: 'Info card on patient view',
          description: 'An example of a CDS Service that returns an info card'
        },
        {
          id: 'suggestion-card',
          hook: 'patient-view',
          title: 'Suggestion card on patient view',
          description: 'An example of a CDS Service that returns a suggestion card'
        },
        {
          id: 'suggestion-card-absolute-link',
          hook: 'patient-view',
          title: 'Suggestion card on patient view with an absolute link',
          description: 'An example of a CDS Service that returns a suggestion card containing a link to an absolute URL'
        },
        {
          id: 'suggestion-card-smart-link',
          hook: 'patient-view',
          title: 'Suggestion card on patient view with a SMART app link',
          description: 'An example of a CDS Service that returns a suggestion card containing a SMART app link'
        },
        {
          id: 'warning-card',
          hook: 'patient-view',
          title: 'Warning card on patient view',
          description: 'An example of a CDS Service that returns a warning card'
        }
      ]
    }))
  }

  // OPTIONS, GET /cds-services/card-age-fhir-request --------------------------
  if (url == '/cds-services/card-age-fhir-request' && ['OPTIONS', 'POST'].includes(method.toUpperCase())) {
    return processPost(req, () => {
      setServiceCommonHeaders(res)
      res.writeHead(200)

      const hook = req.post && req.post.hook
      // const birthDate = req.post && req.post.prefetch && req.post.prefetch.patient && req.post.prefetch.patient.birthDate
      const cards = []
      if (hook === 'patient-view') {
        // const age = birthDate && moment(birthDate).isValid() ? moment().diff(birthDate, 'years') : null

        const detail = 'TODO:' // `[IN PROGRESS] ### Details\n\nInvalid date of birth \n\n`
        // if (age !== null && age >= 0) {
        //   detail = `Patient age: ${age} ${age > 1 ? 'years' : 'year'}\n\n`
        // }

        const indicator = 'info'
        // if (age !== null && (age < 10 || age > 80)) {
        //   indicator = 'warning'
        // } else if (age === null || age < 0) {
        //   indicator = 'critical'
        // }

        // switch (indicator) {
        //   case 'info':
        //     detail += `![Image of something](https://picsum.photos/id/450/640/240)\n\n`
        //     break
        //   case 'warning':
        //     detail += `![Image of something](https://picsum.photos/id/476/640/240)\n\n`
        //     break
        //   case 'critical':
        //     detail += `![Image of something](https://picsum.photos/id/180/640/240)\n\n`
        //     break
        // }

        cards.push({
          summary: 'Patient age check',
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

  // OPTIONS, GET /cds-services/card-age-prefetch ------------------------------
  if (url == '/cds-services/card-age-prefetch' && ['OPTIONS', 'POST'].includes(method.toUpperCase())) {
    return processPost(req, () => {
      setServiceCommonHeaders(res)
      res.writeHead(200)

      const hook = req.post && req.post.hook
      const birthDate = req.post && req.post.prefetch && req.post.prefetch.patient && req.post.prefetch.patient.birthDate
      const cards = []
      if (hook === 'patient-view') {
        const age = birthDate && moment(birthDate).isValid() ? moment().diff(birthDate, 'years') : null

        let detail = `### Details\n\nInvalid date of birth \n\n`
        if (age !== null && age >= 0) {
          detail = `Patient age: ${age} ${age > 1 ? 'years' : 'year'}\n\n`
        }

        let indicator = 'info'
        if (age !== null && (age < 10 || age > 80)) {
          indicator = 'warning'
        } else if (age === null || age < 0) {
          indicator = 'critical'
        }

        switch (indicator) {
          case 'info':
            detail += `![Image of something](https://picsum.photos/id/450/640/240)\n\n`
            break
          case 'warning':
            detail += `![Image of something](https://picsum.photos/id/476/640/240)\n\n`
            break
          case 'critical':
            detail += `![Image of something](https://picsum.photos/id/280/640/240)\n\n`
            break
        }

        cards.push({
          summary: 'Patient age check',
          indicator,
          detail,
          source: {
            label: 'CDS Service Demo',
            url: 'https://example.com/source',
            icon: 'https://picsum.photos/id/400/100/100'
          }
        })
      }

      return res.end(JSON.stringify({ cards }))
    })
  }

  // OPTIONS, GET /cds-services/critical-card ----------------------------------
  if (url === '/cds-services/critical-card' && ['OPTIONS', 'POST'].includes(method)) {
    setServiceCommonHeaders(res)
    res.writeHead(200)

    return res.end(JSON.stringify({
      cards: [
        {
          summary: 'Critical card on patient view',
          indicator: 'critical',
          detail: '### Details\n\nThis is a simple critical card\n\n',
          source: {
            label: 'CDS Service Demo',
            url: 'https://example.com/source'
          }
        }
      ]
    }))
  }

  // OPTIONS, GET /cds-services/info-card --------------------------------------
  if (url === '/cds-services/info-card' && ['OPTIONS', 'POST'].includes(method)) {
    setServiceCommonHeaders(res)
    res.writeHead(200)

    return res.end(JSON.stringify({
      cards: [
        {
          summary: 'Info card on patient view',
          indicator: 'info',
          detail: '### Details\n\nThis is a simple info card\n\n',
          source: {
            label: 'CDS Service Demo',
            url: 'https://example.com/source'
          }
        }
      ]
    }))
  }

  // OPTIONS, GET /cds-services/suggestion-card --------------------------------
  if (url === '/cds-services/suggestion-card' && ['OPTIONS', 'POST'].includes(method)) {
    setServiceCommonHeaders(res)
    res.writeHead(200)

    return res.end(JSON.stringify({
      cards: [
        {
          summary: 'Suggestion card on patient view',
          indicator: 'warning',
          detail: `### Details\n\nThis is a simple suggestion card\n\n![Image of something](https://picsum.photos/id/476/640/240)\n\n`,
          source: {
            label: 'CDS Service Demo',
            url: 'https://example.com/source',
            icon: 'https://picsum.photos/id/400/100/100'
          },
          selectionBehavior: 'at-most-one',
          suggestions: [
            {
              uuid: uuidv4(),
              label: 'Create New Binary Resource',
              actions: [
                {
                  type: 'create',
                  description: 'Suggested action of type `create`',
                  resource: {
                    resourceType: 'Binary',
                    contentType: 'image/jpeg',
                    content: '',
                    data: ''
                  }
                }
              ]
            }
          ]
        }
      ]
    }))
  }

  // OPTIONS, GET /cds-services/suggestion-card-absolute-link ------------------
  if (url === '/cds-services/suggestion-card-absolute-link' && ['OPTIONS', 'POST'].includes(method)) {
    setServiceCommonHeaders(res)
    res.writeHead(200)

    return res.end(JSON.stringify({
      cards: [
        {
          summary: 'Suggestion card with an absolute link',
          indicator: 'info',
          detail: '### Details\n\nThis is a simple suggestion card with a link to an absolute URL\n\n',
          source: {
            label: 'CDS Service Demo',
            url: 'https://example.com/source'
          },
          links: [
            {
              label: 'Suggested Link',
              url: 'https://example.com/suggested-link',
              type: 'absolute'
            }
          ]
        }
      ]
    }))
  }

  // OPTIONS, GET /cds-services/suggestion-card-smart-link ------------------
  if (url === '/cds-services/suggestion-card-smart-link' && ['OPTIONS', 'POST'].includes(method)) {
    setServiceCommonHeaders(res)
    res.writeHead(200)

    return res.end(JSON.stringify({
      cards: [
        {
          summary: 'Suggestion card with a SMART app link',
          indicator: 'info',
          detail: `### Details\n\nThis is a simple suggestion card with a SMART app link\n\n![Image of something](https://picsum.photos/id/476/640/240)\n\n`,
          source: {
            label: 'CDS Service Demo',
            url: 'https://example.com/source',
            icon: 'https://picsum.photos/id/400/100/100'
          },
          links: [
            {
              label: 'Suggested App',
              url: 'https://app.example.com/launch',
              type: 'smart',
              appContext: '{"test":1}'
            }
          ]
        }
      ]
    }))
  }

  // OPTIONS, GET /cds-services/warning-card -----------------------------------
  if (url === '/cds-services/warning-card' && ['OPTIONS', 'POST'].includes(method)) {
    setServiceCommonHeaders(res)
    res.writeHead(200)

    return res.end(JSON.stringify({
      cards: [
        {
          summary: 'Warning card on patient view',
          indicator: 'warning',
          detail: '### Details\n\nThis is a simple warning card\n\n',
          source: {
            label: 'CDS Service Demo',
            url: 'https://example.com/source'
          }
        }
      ]
    }))
  }

  // 404 -----------------------------------------------------------------------
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.writeHead(404)
  return res.end(JSON.stringify({ status: 'Not found' }))
})

const port = process.env.PORT || 3000
console.log('::: port:', port)

server.listen(port)

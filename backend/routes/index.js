const express = require('express');
const router = express.Router();
const request = require('request')
const fs = require('fs')
const cors = require('cors')
const _ = require('underscore')
const util = require('util')
const async = require('async')
const exec = require('child_process').exec;
// const glob = require("glob")
const path = require('path');
const os = require('os');
const fetch = require('node-fetch')
const proxy = require('express-http-proxy');
const ffmpeg = require('fluent-ffmpeg');
const Stream = require('node-rtsp-stream')
const Youtube = require('youtube-stream-url')
const WebSocket = require('ws');


const websocket = require('websocket-stream')

var rstpStream

require('dotenv').config()

router.all('*', cors())
module.exports = router;

// TODO, this line is temporary
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Authenticate to powerai
var username, password, url, token

if (process.env.user) {
  username = process.env.user
  password = process.env.password
  url = process.env.url
  console.log(username, password, url)
  getToken(username, password, url)
  // token = getToken(username, password, url)
}



// var tokenRefreshTime =
function getToken(username = undefined, password = undefined, url = undefined) {
  return new Promise((resolve, reject) => {
    console.log("requesting auth token")
    var options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
        password: password,
        grant_type: "password"
      })
    }
    console.log("token options")
    console.log(options)
    console.log("fetching from: " + url + "/api/tokens")
    fetch(url + "/api/tokens", options).then((r) => {
      r.json().then((t) => {
        console.log("token received: " + t.token)
        token = t.token
        tokenRefreshTime = Date.now()
        resolve(t.token)
      })
    }).catch((err) => {
      console.log("error finding token")
      console.log(err)
      reject(err)
    })
  })
}

router.post('/token', function(req, res) {
  console.log("token: " + token)
  // if token hasn't expired yet
  if ((token) && (tokenRefreshTime) && (Date.now() - 60 * 60 * 100 < tokenRefreshTime)) {
    console.log("token hasn't expired yet, sending exisiting token")
    res.send(token)
    // otherwise, get a new token
  } else {
    console.log("requesting new token")
    console.log(req.body)
    console.log(req.body.url)
    if (req.body.username && req.body.password) {
      console.log(`creds found in http request: ${req.body.username} ${req.body.password} ${req.body.url}`)
      username = req.body.username
      password = req.body.password
      getToken(req.body.username, req.body.password, req.body.url).then((t) => {
        token = t
        console.log(t)
        res.send(t)
      })

    } else {
      console.log("username / password not set")
      res.send("username / password not set")
      res.send(401)
    }
  }
});


// app.use('/download', function(req, res) {
//   proxy(url)
//   // res.send(200)
// });

var getInferences = function(url, token) {
  return new Promise((resolve, reject) => {
    var options = {
      method: "GET",
      headers: {
        "X-Auth-Token": token
      }
    }
    console.log(`posting ${url}/api/inferences`)
    console.log(token)
    console.log(options)
    console.log("in getInferences method")
    console.log(url + "/api/inferences")
    fetch(url + "/api/inferences", options).then((r) => {
      // result = r
      // console.log(r)
      console.log("inferences received")
      r.json().then((e) => {
        inferences = e
        resolve(inferences)
        // next get detailed inference info by id
      }).catch((err) => {
        console.log("error parsing json")
        console.log(err)
      })
    }).catch((err) => {
      console.log("error fetching inferences")
      console.log(err)
    })
  })
}

var datasets = []
var getDatasets = function() {
  // var datasets = []
  var options = {
    method: "GET",
    headers: {
      "X-Auth-Token": token
    }
  }
  console.log(options)
  // return new Promise( (resolve, reject) => {

  fetch(url + "/api/datasets", options).then((r) => {
    // result = r
    // console.log(r)
    r.json().then((ds) => {
      console.log("datasets received")
      // resolve(inferences)
      ds.map((set, idx) => {
        fetch(`${url}/api/datasets/${set._id}/files`, options).then((r) => {
          console.log("receiving files from set " + set._id)
          r.json().then((files) => {
            console.log("parsed json")
            console.log(files)
            datasets = datasets.concat(files)
            if (idx == ds.length) {
              console.log('datasets')
              // console.log(datasets)
              resolve(datasets)
            }
          })
        })
        // datasets.push()

      })
      // next get detailed inference info by id
    }).catch((err) => {
      console.log("error parsing json")
      console.log(err)
    })
  }).catch((err) => {
    console.log(err)
  })

  // }) // end promise

  // /datasets
  // /datasets/{id}/files
}


// /*
// const wss = websocket.createServer({
//   perMessageDeflate: false,
//   server: "http://localhost:9999"
// })
// }, handle)

// function handle(stream) {
//   fs.createReadStream('bigdata.json').pipe(stream)
// }


router.get('/ytstream', function(req, res) {
  // if (req.body.vid_url) {
  //   request(req.body.vid_url).pipe(res)
  // }

  console.log(`streaming ${vid_url}`)
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")
  res.header("Access-Control-Allow-Credentials", "true")

  try {
    request(vid_url).pipe(res)
  } catch(e) {
    console.log(e)
    res.send(500)
  }
})

var vid_url


router.post('/stream/:time', function(req, res) {

})

router.post('/stream', function(req, res) {
  console.log("stream action received")
  console.log(req.body)
  if (req.body.action == 'start') {
    // /*
    if ((req.body.url.toLowerCase().includes('youtube')) || (req.body.url.includes('you.tu'))) {
      Youtube.getInfo({url: req.body.url}).then( (video) => {
        vid_url = video.formats.filter( f => f.mimeType.includes("video/mp4") )[0].url
        console.log("returning url")
        res.json({url: vid_url})
      })
    } else {
    // */
      // expect an rtsp url.
      if ((req.body.username) && (req.body.password) && (req.body.url) ) {
        var endpoint = `${req.body.username}:${req.body.password}@${req.body.url.replace('rtsp://', '')}`
      }
      else if (req.body.url) {
        var endpoint = `${req.body.url}`
      } else if (process.env.RTSP_URL) {
        console.log("setting rtspurl from env variable")
        var endpoint = process.env.RTSP_URL
      } else {
        var endpoint = `${req.body.url}`
      }
      res.send(200)
      console.log(endpoint)
      try {
        if (rstpStream) {
          rstpStream.stop()
        }
        rstpStream = new Stream({
          name: 'name',
          streamUrl: endpoint,
          wsPort: 6004,
          ffmpegOptions: { // options ffmpeg flags
            '-stats': '', // an option with no neccessary value uses a blank string
            '-r': 30 // options with required values specify the value after the key
          }
        })
      } catch(e) {
        console.log(e)
      }
    }

  } else if (req.body.action == 'stop') {
    console.log("received request to stop")
    console.log(rstpStream)
    rstpStream.stop()
    res.send(200)
  }

  // require('request').post({url: paiv_url_full, formData: formData}).pipe(res)
})
// */

router.get('/inferences', function(req, res) {
  console.log("getting detailed inference data")
  console.log(req.headers)
  let url = req.headers['x-proxy-url']
  let token = req.headers['x-auth-token']
  console.log(`url: ${req.headers['x-proxy-url']}\n token: ${req.headers['x-auth-token']}`)
  getInferences(url, token).then((i) => {
    // if no new inferences, keep vars as is
    // if (inferences.map.sort() == i.inferences_list.sort()) {
    //   console.log("no new inferences, skipping update")
    // } else {
    console.log("received list of inferences")
    inferences = i.inferences_list
    res.send(i.inferences_list)
    // res.send(inferenceData)
    // console.log(i)
    i.inferences_list.map((inf) => {
      // setTimeout(function(){ processInferences(i); }, 1000);
      processInferences(url, token, inf) // store result in an object, reference by id
    })
    // }
  }).catch( (err) => {
    console.log("err getting inference info")
    console.log(err)
  })
});

/*
router.get('/custominferences', function(req, res) {
  console.log("getting custom inferences")
  var customInferences = []
  glob('../inferences/*json', {}, (err, files) =>{
    files.map((f, idx) => {
      console.log(f)
      var i = fs.readFileSync(f);
      customInferences.push(i)
      if (idx == (files.length - 1)  ) {
        res.json(customInferences)
      }
    })
  })
    // }
});
*/

router.get('/inferencedetailed', function(req, res) {
  console.log("requesting detections for all inferences ")
  console.log(inferenceData)
  res.json(inferenceData)

});


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

var checkInferences = function() {
  return new Promise((resolve, reject) => {
    //
    var retries = 5
    var r = [...Array(retries).keys()]
    r.map((idx) => {
      setTimeout(() => {
        console.log("printing")
      }, 1000)
    })
    //   console.log(Object.keys(inferenceData).sort())
    //   console.log(Object.keys(inferences).sort())
    //   inferences.map(i => i._id)
    //   sleep(500).then(() => {
    //     if (Object.keys(inferenceData).sort() == Object.keys(inferences).sort()) {
    //       resolve()
    //     } else {
    //       console.log("sleeping")
    //       }
    //     }
    //   })
    //   if (idx == retries) {
    //     reject()
    //   }
    // })

  })
}

// Flow,
// User loads main dashboard page
// Request is sent to receive inferences
// Process list of inferences
// Once processing is done, return processed results to frontend


// inference_id = "7afb7810-bdfa-4968-aafc-06a8bd758f5b"
// 1. Split frames based off fps modulus
// 2. Get array of count of each

// var countObjects = function( ) {
//
// }
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
var inferenceData = {} // object to keep inference analytics
var fps = {}
var seconds = {}

var getFPS = function(url, endpoint, id, numFrames) {
  return new Promise((resolve, reject) => {
    // if (url) {
    console.log(`inference ${id}`)
    console.log("ffprobe analyzing " + `${url}${endpoint}`)

    // ffprobe(url).then(metadata => {
    //   console.log(metadata);
    // }).catch( err => console.log(err) )
    ffmpeg.ffprobe(url + endpoint, (err, data) => {
      if (err) {
        console.log("ffprobe failure")
        console.log(err)
        // reject(err)
        var fps_reading = 60
        fps[id] = 60
        seconds[id] = numFrames / 60
        resolve(60)
      } else {
        console.log("ffprobe success")
        console.log(`data ${data}`)
        var fps_reading = data.streams.filter(s => s.codec_type == 'video')[0]['avg_frame_rate']
        // var fps_reading = data['streams'][0]['avg_frame_rate']
        var vid_length = data.streams.filter(s => s.codec_type == 'video')[0]['duration']
        var fps_nums = fps_reading.split('/')
        // inferenceData[det._id]['fps'] = fps_nums[0] / fps_nums[1]
        var fps_calc = Math.round(fps_nums[0] / fps_nums[1])
        console.log(`fps_calc ${fps_calc}`)
        fps[id] = fps_calc
        seconds[id] = Math.round(vid_length)
        console.log(fps_calc)
        resolve(fps_calc)
      }
    })
    //   ffmpeg.ffprobe(url, (err, data) => {
    //     console.log(`data ${JSON.stringify(data)}`)
    //     console.log(data['streams'][0]['avg_frame_rate'])
    //     console.log(`err ${err}`)
    //   })
    // } else {
    //   console.log("problem initializing ffprobe")
    //   reject("No valid url provided")
    // }
  })
}

var matchFrames = function(frameNumbers, seconds, framesPerSecond) {
  var matches = []

  // [...Array(seconds).keys()].map((s) => {
  Array.from({
    length: seconds
  }, (x, i) => i).map((s) => {
    console.log("---------------------")
    var start = (framesPerSecond * s)
    console.log(`checking second ${s} at frame ${start}`)
    if (frameNumbers.includes(start)) {
      console.log("found matching frame in " + start)
      matches.push(start)
      // return start
    } else {
      for (i = start; i <= (start + framesPerSecond); i++) {
        // console.log("checking frame: " + i)
        if (frameNumbers.includes(i)) {
          console.log("found matching frame in " + i)
          matches.push(i)
          break
          // return i
        }
        if (i == (start + framesPerSecond)) {
          matches.push(start)
          break
        }
      }
    }
  })
  // after loop completes
  return matches
}


// m = matchFrames(frames, seconds, framesPerSecond)


var processInferences = function(url, token, i) {
  // var infDetails = JSON.parse(fs.readFileSync('../inference.json').toString())
  // var d = JSON.parse(data) //JSON.parse(fs.readFileSync('../detections.json').toString())
  // get detections.json
  // reduce detections, select frames by modulus
  var options = {
    method: "GET",
    headers: {
      "X-Auth-Token": token
    }
  }
  // request inference detections

  // for classification, we need
  // start_time
  // end_time
  // label

  // act is action detection model

  console.log("calling url")
  console.log(url + "/api/inferences/" + i['_id'])
  processing = true
  fetch(url + "/api/inferences/" + i['_id'], options).then((r) => {
    // result = r
    console.log("r")
    console.log(JSON.stringify(r))
    console.log("r.status")
    console.log(r.status)
    r.json().then((det) => {
      console.log(`detections received for inf ${det._id}`)
      console.log(`det.classified ${JSON.stringify(det.classified)}`)
      // inferenceData[det['_id']] = det
      if (det['video_out']) {
        var d = det.classified
        var totalFrames = det.total_frames
        var times = det.classified.map(f => f.time_offset)
        var allFrames = det.classified.map(f => f.frame_number)
        console.log(`allFrames ${allFrames}`)
        var frameNumbers = Array.from(new Set(det.classified.map(f => f.frame_number))).sort((a, b) => a - b)
        console.log(`frameNumbers ${JSON.stringify(frameNumbers)}`)
        var endpoint = encodeURI(det.video_in)
        console.log(endpoint)
        getFPS(url, endpoint, det['_id'], totalFrames).then(() => {
          console.log("received fps")
          var framesPerSecond = fps[det._id]
          console.log("framesPerSecond")
          console.log(framesPerSecond)
          console.log(`seconds[det['_id']] ${seconds[det['_id']]}`)
          // console.log(`det ${JSON.stringify(det)}`)
          console.log(`det['_id'] ${det['_id']}`)
          var m = matchFrames(frameNumbers, seconds[det['_id']], framesPerSecond)
          console.log(`m ${m}`)
          console.log(`m.length ${m.length}`)
          // after getting an array of frame numbers, select a frame number corresponding to each second. this is needed because paiv doesn't process every single frame, likely skips those that are very similar

          // var frameNumbers = [...new Set(reducedFrames.map(e => Number(e.frame_number)))].reverse()

          var reducedFrames = d.filter(e => e.frame_number % framesPerSecond == 0)
          var allFrames = d.map(e => e.frame_number)

          console.log(`allFrames ${allFrames}`)

          console.log("frameNumbers")
          console.log(frameNumbers)

          console.log("totalFrames " + String(totalFrames))
          console.log("d length: " + String(d.length))
          console.log("times length " + String(times.length))
          console.log("reducedFrames.length")
          console.log(reducedFrames.length)

          // get unique classes
          var labels = [...new Set(reducedFrames.map(e => e.label))]
          // get list of unique frame numbers
          // get total number of objects found
          var totalObjectCount = []
          m.map((num) => {
            totalObjectCount.push(reducedFrames.filter(f => f.frame_number == num).length)
          })

          // get number of classes by frame number
          objectCount = {} // TODO, function should be async instead of using global
          labels.map((label, lIdx) => {
            objectCount[label] = []
            m.map((num, frameIdx) => {
              var numInstances = reducedFrames.filter(f => (f.frame_number == num && f.label == label)).length
              objectCount[label].push(numInstances)
              if ((frameIdx == (m.length - 1)) && (lIdx == (labels.length - 1))) {
                console.log("processing complete")
                console.log(objectCount)
                processing = false
                // inferenceData[i['_id']]['objectCount'] = objectCount
                inferenceData[i['_id']] = objectCount

                // return objectCount
              }
            })
          })
        })
      }
      // var totalTime = (Math.max(...times) * .001) // in seconds
      // var proFrames = det.processed_frames
      // var framesPerSecond = Math.round(proFrames / totalTime)
    }).catch((err) => {
      console.log("error parsing json")
      console.log(err)
    })
  }).catch((err) => {
    console.log(err)
  })


}

// get detections from powerai with
// powerai-vision-ny/api/inferences/7afb7810-bdfa-4968-aafc-06a8bd758f5b

// Global dashboard view
// List of inferences
// List of all pic/vid thumbnails



// Detailed View
// Get and process detections for a given inference
// Should give a response to render the following
// Draw a graph (line, circle)
//

router.get('/inference/:infId', function(req, res) {
  console.log("requesting detections for id: " + req.params.infId)
  if (req.params.infId in inferenceData.keys()) {
    res.send(inferenceData[req.params.infId])
  } else {
    res.send(404)
  }
  // if (req.user && req.password) {
  /*
    var options = {
      method: "GET",
      headers: {
        "X-Auth-Token": token
      }
    }
    fetch( url + "/api/inferences/" + id, options ).then ( (r) => {
      // result = r
      // console.log(r)
      r.json().then( (e) => {
        console.log("inference")
        inferences = e
        console.log(e)
        res.send(inferences)
      } ).catch((err) => {
        console.log("error parsing json")
        console.log(err)
      } )
    }).catch( (err) => {
      console.log(err)
    } )*/
});


/*
router.post('/api/chaincode', function(req, res) {
  console.log("chaincode request received")
  console.log(req.body)
  var chaincode = req.body.params.ctorMsg
  var chaincode_query = JSON.stringify({
    "Args": [chaincode.function].concat(chaincode.args)
  })
  if (typeof(client) !== 'undefined') {
    console.log("invoking chaincode with hfc client")
    console.log("req")
    console.log(req.body)
    console.log("req.body.method")
    console.log(req.body.method)
    if (req.body.method && req.body.method.includes('invoke')) {
      console.log("invoking request")
      var transaction_id = client.newTransactionID(true)
      var txRequest = {
        chaincodeId: sec_chaincode.name,
        chaincodeVersion: sec_chaincode.version,
        txId: transaction_id,
        fcn: req.body.params.ctorMsg.function,
        args: req.body.params.ctorMsg.args
      }
      console.log(txRequest)
      var txResult = proposeAndSubmitTransaction(txRequest)
      res.send(200)
    } else {
      console.log("querying chaincode with hfc client")
      var txRequest = {
        chaincodeId: sec_chaincode.name,
        chaincodeVersion: sec_chaincode.version,
        fcn: req.body.params.ctorMsg.function,
        args: req.body.params.ctorMsg.args
      }
      console.log("txRequest")
      console.log(txRequest)
      channel.queryByChaincode(txRequest).then((cc_response) => {
        console.log("cc query response received")
        console.log(cc_response[0].toString())
        res.json(cc_response[0].toString())
      }).catch((err) => {
        console.log("cc query failed")
        console.log(err)
        res.json(err)
      })
    }
  }

});

function submitTransaction(txRequest) {
  console.log(util.format('Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s"', proposalResponses[0].response.status, proposalResponses[0].response.message));
  var promises = []
  var sendPromise = channel.sendTransaction({
    proposalResponses: proposalResponses,
    proposal: proposal
  })
  sendPromise.then((result) => {
    console.log("transaction result")
    console.log(result)
    res.send(result)
  })
}

function proposeAndSubmitTransaction(txRequest) {
  console.log("sending transaction proposal")
  channel.sendTransactionProposal(txRequest).then((proposalRes) => {
    console.log("response received")
    var proposalResponses = proposalRes[0];
    var proposal = proposalRes[1];
    let isProposalGood = false;
    console.log("proposalResponses[0].response")
    console.log(proposalResponses[0].response)
    if (proposalResponses && proposalResponses[0].response && proposalResponses[0].response.status === 200) {
      console.log('Transaction proposal was accepted');
      channel.sendTransaction({
        proposalResponses: proposalResponses,
        proposal: proposal
      }).then((res) => {
        console.log("Transaction result was accepted")
        return true
      })
    } else {
      console.log('Transaction proposal was rejected');
      return false
    }
  }).catch((err) => {
    return false
    console.log(err)
  });
}

function uploadAdminCert(req, mspId) {
  var uploadAdminCertReq = {
    "msp_id": mspId,
    "adminCertName": "admin_cert" + Math.floor(Math.random() * 1000),
    "adminCertificate": user._signingIdentity._certificate,
    "peer_names": Object.keys(client._network_config._network_config.peers),
    "SKIP_CACHE": true
  }
  if (! req.body.api_endpoint.includes('/api/v1')) {
    var api_endpoint = req.body.api_endpoint + '/api/v1'
  } else {
    var api_endpoint = req.body.api_endpoint
  }
  var options = {
    url: api_endpoint + '/networks/' + req.body.network_id + '/certificates',
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Accept-Charset': 'utf-8',
      "Authorization": "Basic " + new Buffer(req.body.key + ":" + req.body.secret, "utf8").toString("base64")
    },
    body: uploadAdminCertReq
  }
  console.log("uploading admin cert")
  request(options, function(err, res, body) {
    console.log("res")
    console.log(res)
    if (err) {
      console.log(err)
    }
  })
}
*/

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fs = require('fs')
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const app = express();
const cors = require('cors')
const multer  = require('multer')
const proxy = require('express-http-proxy');
const ffmpeg = require('fluent-ffmpeg');
const glob = require('glob');
const fetch = require('node-fetch')
const FormData = require('form-data');
const spawn = require('child_process').spawn;
const PassThrough = require('stream').PassThrough;
const stream = require('stream')
const uuid = require('uuid').v4



require('dotenv').config()

console.log("Backend Server Started.")
console.log(process.cwd())


// app.use(cors({credentials: false, origin: true}))

// TODO, this line is temporary and should be moved for systems which have certs
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;


app.use(cors())
app.options('*', cors())
app.use(function(req, res, next) {
  if (req.method === 'OPTIONS') {
    console.log('!OPTIONS');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")
    res.header("Access-Control-Allow-Credentials", "true")
    res.writeHead(200, headers);
    res.end();
  }
  next();
});

const bodyParser = require('body-parser')
app.use(bodyParser.json());
// bodyParser.raw({ type: 'application/vnd.custom-type' })

var StringDecoder = require('string_decoder').StringDecoder;

app.use('/proxyget', function(req, res) {
    console.log(req)
    const headers = req.headers
    console.log("headers")
    console.log(headers)
    const url = headers['x-proxy-url']
    console.log(`url ${url}`)
    console.log(`req.url ${req.url}`)
    const paiv_url = (url + req.url).replace('http://', 'https://');
    console.log("sending proxy get request to " + paiv_url)
    const options = {
      url: paiv_url,
      headers: {
        'x-proxy-url': headers['x-proxy-url'],
        'x-auth-token': headers['x-auth-token']
      }  //Object.assign(headers, {'user-agent': 'node-fetch/1.0'})
    }
    console.log(`options ${JSON.stringify(options)}`)
    const decoder = new StringDecoder('utf8');


    require('request').get(options)
      .on('error', function(err) {
        console.log("proxyget error")
        console.error(err)
      })
      .on('response', function(response) {
        console.log(response.statusCode) // 200
        console.log(response.headers['content-type']) // 'image/png'
      })
      .on('data', function(data) {
        // console.log("proxyget data chunk received")
        // console.log(Buffer.from(data).toString('utf8'))
        var textChunk = decoder.write(data);
        // console.log(textChunk)
      })
      .on("finish", function(){
        console.log("closed")
        console.log(decoder)
      }).pipe(res)
});

// app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }));


// app.set('views', path.join(__dirname, ''));

// host videos in a static path. this is only required for videos that are broken up into frames to be used in classifier
app.use('/videos', express.static(__dirname + '/videos/'));

// host inferences in a static path. this relates to the video above
app.use('/custom_inferences', express.static(__dirname + '/inferences/'));


app.use(require("express-form-data").parse())
// app.use(formData.stream())

// write video frames to x images
var splitVideo = function(vid_path) {
  // var streams = []
  console.log("splitting video")
  return new Promise( (resolve, reject) => {
    ffmpeg(vid_path)
      .outputOptions(['-vf fps=1'])
      .output('%d.png')
      .on('end', resolve)
      .on('error', reject)
      .run()
      // .output(streams(%d))
      // .on('end', resolve(streams))
  })
}

const { exec } = require("child_process");

app.use('/mergeframes', function(req, res) {
  console.log(req)
  // console.log(Object.keys(req))
  var outputFile = './out.mp4'
  var output = fs.createWriteStream(outputFile);
  // var textFile = fs.createWriteStream('./input.txt');
  //var cmd = "ffmpeg -r 1/5 -y -r 1/5 -f concat -safe 0  -i input.txt -c:v libx264 -vf fps=25 -pix_fmt yuv420p out.mp4"
  var cmd = "ffmpeg -y -f concat -safe 0 -i input.txt -vsync vfr -pix_fmt yuv420p out.mp4"
  var fileContents = ""
  // // videoCodec
  // var cmd = ffmpeg()
  // var inputOptions = ["-r", "60", "-f", "image2", "-s", "1920x1080"] //,  "-crf", "25", "-pix_fmt", "yuv420p"] // "-vcodec", "libx264",
  // var outputOptions =  ['-vcodec libx264 -crf 25  -pix_fmt yuv420p']
  let files = req.files
  console.log(files)
  var headers = req.headers
  console.log("headers")
  console.log(headers)
  if (Object.keys(headers).includes("x-interval")) {
    var interval = headers["x-interval"]
  } else {
    var interval = "1"
  }
  console.log(`interval ${interval}`)
  var filenames = Object.keys(files)
  filenames.map( (name, idx) => {
    let file = files[name]
    console.log(`handling file ${file.fieldName}`)
    let path = file.path
    console.log(`handling image at path ${path}`)
    // inputOptions.push('-i', path)
    fileContents += `file '${path}'\nduration ${interval}\n`
    console.log(`${idx} / ${filenames.length -1}`)
    // cmd.addInput(path) //fs.createReadStream( path ))
    // cmd.addInput('/var/folders/2k/hljc8qsn3fq3j8rkh4g9dy6m0000gn/T/i99pMRRaShDBJBCcHgbOaTjT.png')
    if (idx == (filenames.length - 1)) {
      fileContents += `file '${path}'`
      console.log("inputs added, merging")
      fs.writeFile('./input.txt', fileContents, function (err) {
        if (err) throw err;
        else {
          // var cmd = spawn("ffmpeg", [cmdArgs.split(' ')]);
          exec(cmd, (error, stdout, stderr) => {
            // if ( error || stderr ) {
            //   console.log("error with ffmpeg merge")
            //   console.log(`${error}`)
            //   console.log(`${stderr}`)
            //   res.sendStatus(500)
            // } else {
              let filePath = process.cwd() + '/' + outputFile
              console.log(`done with file, returning ${filePath}`)
              res.sendFile(filePath)
            // }
          })


        }
      });

      // console.log(inputOptions)
      // cmd.inputOptions(inputOptions).output(output).outputOptions(outputOptions).on('end', function() {
      //   console.log('Finished merging');
      //   console.log(output);
      // }).run();
    }
  })
})

app.use('/proxypost', function(req, res) {
  // console.log(upload)
  console.log("handling post request")
  console.log(`req.headers ${JSON.stringify(req.headers)}`)

  var paiv_url = req.headers['x-proxy-url']
  var paiv_url_full = paiv_url + req.url;
  console.log(`paiv_url: ${paiv_url}`)
  console.log(`posting to ${paiv_url_full}`)

  var fragment = Object.keys(req.headers).includes('x-fragment-video')
  console.log(`${fragment}  ${typeof fragment}`)
  if (fragment) {
    var filename = req.headers['x-file-name']
    console.log("fragmenting video")
    var frameResults = []

    // get length of video
    // TODO, write images to buffer instead of file
    // ffmpeg.ffprobe(vid_path, (err, data) => {
    //   var vid_length = data.streams.filter(s => s.codec_type == 'video')[0]['duration']
    //   var fps_reading = data.streams.filter(s => s.codec_type == 'video')[0]['avg_frame_rate']
    //   return // num of pics
    // })



    var fileBlob = req.files['blob']['path']
    fs.copyFile(fileBlob, `./videos/${filename}` , (err) => {
      if (err) throw err;
      console.log(`${fileBlob} was copied to ./videos/${filename}`);
    });

    var readStream = fs.createReadStream(fileBlob)
    splitVideo(readStream).then( () => {
      console.log("video split")

      glob('*.png', {}, (err, files) =>{
        files.map( (f, idx) => {
          console.log(`processing frame ${idx}`)
          console.log(`processing file ${f}`)
          var readStream = fs.readFileSync(f) //  fs.createReadStream(f)
          const form = new FormData()
          form.append("containHeatMap", "true")
          form.append('files', readStream)
          console.log(form)
          var options = {
            method: "POST",
            headers: {
              "X-Auth-Token": req.headers['x-auth-token']
            },
            body: form
          }

          console.log("posting frame to vis server")
          fetch(paiv_url_full, options).then((r) => {
            console.log(`inf response received ${idx}`)
            r.json().then((result) => {
              console.log("inf json parsed")
              // console.log(result)
              // collect heatmaps and send back.
              // TODO, also need to host video on this server since
              frameResults[idx] = {
                imageUrl: result['imageUrl'],
                classified: result['classified'],
                heatmap: result['heatmap'],
                result: result['result'],
                filename: filename,
                id: result['webAPIId'] // TODO, switch to "webAPIId", was "imageMd5"
              }
              if (( frameResults.length >= (files.length - 1) ) && ( frameResults.filter( f => !!f ).length == 0 )) { // (idx == (files.length - 1)) {
                console.log("all frames analyzed, returning frameResults to UI")
                console.log(`frame ${frameResults.length}`)
                var id = uuid()
                var inference = {
                    id: id,
                    results: frameResults,
                    url: `http://localhost:30000/videos/${filename}`
                }
                res.json(inference)
                fs.writeFileSync(`./inferences/${id}.json`, JSON.stringify(inference))
              }
              console.log(result['result'])
              /*
              console.log("writing heatmap file")
              fs.writeFileSync(`${idx}_heat.png`, result['heatmap'].split(',')[1] , {encoding: 'base64'},
                function(err) {
                  if (err) {
                    console.log(err)
                  } else {
                    console.log(`saved file ${idx}_heat.png`)
                  }
                }
              )
              */
              // fs.writeFile(`${idx}_heat.png`, result['heatmap'])
              // body['']

            })
          }).catch( (err) => {
            console.log(err)
          })
        })
      })

    })
    // ffmpeg(vid_path).on('error', function(err, stdout, stderr) {
    //     console.log('Cannot process video: ' + err.message);
    // });
  }

  // /*
  else {
    // TODO, uncomment, after getting split to work
    console.log(`req.files ${JSON.stringify(req.files)}`)
    var filePath = req.files['blob']['path']
    console.log(`filePath ${filePath}`)
    var readStream = fs.createReadStream(filePath)
    var formData = {
      files: readStream,
      containHeatMap: "true",
      genCaption: "true"
    }
    try {
      // crashes server
      require('request').post({url: paiv_url_full, formData: formData}).pipe(res)
    } catch(err) {
      console.log(err)
    }
  }
  // */
});


// view engine setup


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// var url = process.env.url
// console.log("url")
// console.log(url)
// app.use('/proxy', proxy(url));

// app.use('/token', function(req, res) {
//   var url = req.url
//   console.log(url)
//   console.log(req)
//   console.log(`setting up proxy for ${url}`)
//   app.use('/proxy', proxy(url))
// })



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));


app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  // res.render('error');
  // res.send(JSON.stringify(err))
  res.json(err)
});

module.exports = app;

# Analyze live video streams using IBM Maximo Visual Inspection

In this Code Pattern we'll provide a web application that has the ability to capture frames from streaming cameras, and analyze each frame using IBM Maximo Visual Inspection. As analysis results are received, they can be grouped into positive or negative categories.

This code pattern is targeted towards users who have access to live streams or CCTV cameras, and would like to apply object detection and image classification to their live camera feeds.

<!-- When the reader has completed this Code Pattern, they will understand how to extract information from an IBM Maximo Visual Inspection instance as a CSV file, and how to visualize and filter the data within a web browser. -->

<!-- The intended audience for this Code Pattern -->

#  Components

* [IBM Maximo Visual Inspection](https://www.ibm.com/us-en/marketplace/ibm-powerai-vision). This is an image analysis platform that allows you to build and manage computer vision models, upload and annotate images, and deploy apis to analyze images and videos. Sign up for a trial account of IBM Maximo Visual Inspection [here](https://developer.ibm.com/linuxonpower/deep-learning-powerai/try-powerai/). This link includes options to provision a IBM Maximo Visual Inspection instance either locally on in the cloud.

# Flow

<img src="https://i.imgur.com/islfQZk.png">


1. User accesses web application and provides login credentials for both the Camera system and IBM Maximo Visual Inspection. User also fills out form to select model and classify images as positive or negative.
2. Node.js backend connects to camera RTSP stream and forwards to frontend web application
3. As frontend plays live video, user clicks "Capture Frame" or "Start Interval"
4. Captured frames are forwarded to IBM Maximo Visual Inspection backend for analysis.
5. Analysis results are rendered in web app, and grouped by user-defined positive/negative labels.

# Prerequisites

* An account on IBM Marketplace that has access to IBM Maximo Visual Inspection. This service can be provisioned [here](https://developer.ibm.com/linuxonpower/deep-learning-powerai/vision/access-registration-form/)

You will also need to train and deploy a custom model beforehand. This can be done following the steps in this [video](https://www.youtube.com/watch?v=-gzGuj3B__U)

* Node.js

Skip to [Steps](#maximo-live-analysis) if you already have node.js installed on your system.

### Install Node.js packages

If expecting to run this application locally, please install [Node.js](https://nodejs.org/en/) and NPM. Windows users can use the installer at the link [here](https://nodejs.org/en/download/).

If you're using Mac OS X or Linux, and your system requires additional versions of node for other projects, we'd suggest using [nvm](https://github.com/creationix/nvm) to easily switch between node versions. Install nvm with the following commands.

```bash
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
```


```bash
# Place next three lines in ~/.bash_profile
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
```


```bash
nvm install v8.9.0
nvm use 8.9.0
```


# Steps

Follow these steps to setup and run this Code Pattern.

1. [Clone repository](#1-clone-repository)
2. [Start web application]
3. [Configure web application]
4. [Observe results]
<!-- 5. [Create a Dashboard](#4-create-dashboard) -->

## 1. Clone repository

```
git clone https://github.com/IBM/maximo-streaming-video-analysis
```

Navigate to the project folder
```
cd maximo-streaming-video-analysis
```

## 2. Start application

Install frontend dependencies
```
cd maximo-streaming-video-analysis
cd frontend
npm install
```

Start frontend
```
npm run serve
```

In a separate terminal tab, install backend dependencies
```
cd maximo-streaming-video-analysis
cd backend
npm install
```

Start backend
```
npm start
```

## 3. Configure web application
Access the web application at [localhost:8080](localhost:8080).

Click "Login" and provide the url, username, and password for the Maximo Visual Inspection instance. These credentials should have been provided in your welcome letter.

<img src="https://i.imgur.com/bIiZkvs.png" />

Next, click "Configure Model" in the Menu. Select your custom model. Then, select objects or classes associated with that model that you'd like to observe in the dashboard. These selected categories can be grouped as either negative or positive.

<img src="https://i.imgur.com/MYBSjPC.png" />

After selecting the relevant model categories, we can then being streaming a video to the application for analysis. Currently, this app supports the following video sources. To stop a video from playing, click "Stop Stream".

1. Webcam - This is the default method, and requires no configuration
2. [RTSP](https://en.wikipedia.org/wiki/Real_Time_Streaming_Protocol) - RTSP is a streaming protocol commonly used by CCTV cameras. To connect to an RTSP stream, click the "Stream RTSP" button, provide the URL and the login credentials (if applicable).
3. Youtube - To playback a Youtube video for analysis, click the "Stream RTSP" button and enter the Youtube URL.
4. Local Video File - Click the "Upload Video" button and drag and drop your video file.

<img src="https://i.imgur.com/6lGIkW0.png" />

After clicking "Submit" in the "Stream RTSP" or "Upload File" modal, the video should immediately begin playing in the browser.

## 4. Observe results

Once the video begins playing, click the "Capture Frame" button to analyze a single frame with the configured model. Click the "Capture Frame Interval" button to analyze a frame every second for 10 seconds.

As results are received that match the model configuration, they will then be rendered in the "Inference Results" section on the right hand side like so.

<img src="https://i.imgur.com/irYp14I.png"/>

Clicking on one of the inference results will show a popup modal with detailed information for that particular inference, such as the identified class/object, heatmap/bounding boxes, and confidence score.

<img src="https://i.imgur.com/X0UnZhd.png" />

# Learn more

<!-- * **Watson IOT Platform Code Patterns**: Enjoyed this Code Pattern? Check out our other [Watson IOT Platform Code Patterns](https://developer.ibm.com/?s=Watson+IOT+Platform). -->

<!-- * **Knowledge Center**:Understand how this Python function can load data into  [Watson IOT Platform Analytics](https://www.ibm.com/support/knowledgecenter/en/SSQP8H/iot/analytics/as_overview.html) -->

# License

This code pattern is licensed under the Apache Software License, Version 2.  Separate third party code objects invoked within this code pattern are licensed by their respective providers pursuant to their own separate licenses. Contributions are subject to the [Developer Certificate of Origin, Version 1.1 (DCO)](https://developercertificate.org/) and the [Apache Software License, Version 2](https://www.apache.org/licenses/LICENSE-2.0.txt).

[Apache Software License (ASL) FAQ](https://www.apache.org/foundation/license-faq.html#WhatDoesItMEAN)

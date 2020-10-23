/* eslint-disable */
<template>


  <div id="app">
    <div>
      <h1>
        IBM Maximo Sample Video Analyzer
      </h1>
    </div>

    <div id="menu" style="margin-top:40px; margin-bottom:40px">
      <div >
        <CvButton style="margin: 0px 10px; text-align: center" type="default" v-on:click="showModal({'name': 'login-modal', 'title': 'Login'})">Login</CvButton>
        <CvButton style="margin: 0px 10px; text-align: center" type="default" v-on:click="showModal({'name': 'configure-model-modal', 'title': 'Configure Model'}) ; getModels()">Configure Model</CvButton>
        <!-- <CvButton style="margin: 0px 10px; text-align: center" type="default" v-on:click="showModal({'name': 'view-configured-models'})">View Configured Models</CvButton> -->
        <CvButton style="margin: 0px 10px; text-align: center" type="default" v-on:click="showModal({'name': 'configure-stream-modal', 'title': 'Stream RTSP'})">Configure Stream</CvButton>
        <CvButton style="margin: 0px 10px; text-align: center" type="default" v-on:click="showModal({'name': 'upload-modal'})">Upload Video</CvButton>
        <CvButton style="margin: 0px 10px; text-align: center" type="default" v-on:click="showModal({'name': 'add-rule'})">Configure Alert</CvButton>
        <CvButton style="margin: 0px 10px; text-align: center" type="default" v-on:click="showModal({'name': 'add-action'})">Configure Action</CvButton>
        <CvButton style="margin: 0px 10px; text-align: center" type="default" v-on:click="getModels()">Get Models</CvButton>
      </div>
    </div>


  <div class="bleed">

    <div class="bx--grid">


    <div class="bx--row">
      <div class="bx--col-lg-4" >
        <cv-tile>


        <div ref="videoHeader" style="height:50px;margin-bottom:20px; top:0;left:0;right:0;margin:auto;width: 50%;position:relative">

          <p> {{instructionsROI}} <p>

          <div style="margin:auto;width: 50%;position:relative">
            <cv-inline-loading
              style="width:180px"
              :state="loadingState"
              :loading-text="loadingText"
            </cv-inline-loading>
          </div>
        </div>

        <div style="height:480px">
            <!-- TODO, should only need a single video/canvas..caveats are
            1. Cannot capture frames from remote video unless we proxy it through backend w/CORS headers
            2. Need backend with ffmpeg
            3. Webcam streams to canvas
            -->

            <!-- Uploaded video -->
            <div style="width: 100%;height:100%;position:absolute;top: 10px; right: 0; bottom: 0; left: 0;margin: auto;">
              <video muted loop @ended="restartStream()" style="z-index: 10;width: 100%;height:480px;" crossorigin="anonymous" ref="video" id="video" width="640" height="480" autoplay></video>
            </div>

            <!-- Remote video -->
            <div ref="remote_video_div" id="remote_video_div" style="visibility: hidden;width: 100%;height:100%;position:absolute;top: 30%; right: 0; bottom: 0; left: 0;margin: auto;">
              <video muted loop @ended="restartStream()"  style="z-index: 5;width: 100%;" crossorigin="anonymous" ref="remote_video" id="remote_video"  autoplay></video>
            </div>

            <!-- RTSP -->
            <div style="width: 100%;height:100%;position:absolute;top: 10px; right: 0; bottom: 0; left: 0;margin: auto;">
              <canvas style="width: 100%;height:480px;z-index: 9;visibility: hidden" crossorigin="anonymous" ref="stream_canvas" id="stream_canvas"  width="640" height="480" ></canvas>
            </div>

            <!-- Webcam -->
            <div style="width: 100%;height:100%;position:absolute;top: 10px; right: 0; bottom: 0; left: 0;margin: auto;">
              <canvas style="z-index: 0; visibility: hidden" crossorigin="anonymous" ref="canvas" id="canvas" ></canvas>
            </div>

            <!-- Overlay canvas to draw ROIs -->
            <div style="z-index: 150;width: 100%;height:50%; position:absolute;right: 0; bottom: 0; left: 0;" ref="canvas_draw_div" id="canvas_draw_div">
              <canvas @mousemove="hover"  @click="draw" style="width:100%;z-index: 150;" ref="canvas_draw" id="canvas_draw"></canvas>
              <!-- @mouseover="hover"  -->
            </div>

            <!-- Overlay canvas to draw user cursor, show rectangle to be drawn -->
            <div style="width: 100%;height:50%; position:absolute;right: 0; bottom: 0; left: 0;" ref="canvas_cursor_div" id="canvas_cursor_div">
              <canvas style="width:100%;z-index: 99" ref="canvas_cursor" id="canvas_cursor"></canvas>
            </div>


            <!-- Canvas to show good labels -->
            <div style="width: 100%;height:50%; position:absolute;right: 0; bottom: 0; left: 0;" ref="canvas_good_draw_div" id="canvas_good_draw_div">
              <canvas style="width:100%;z-index: 99;" ref="canvas_good" id="canvas_good"></canvas>
            </div>

            <!-- Canvas to show bad labels -->
            <div style="width: 100%;height:50%; position:absolute;right: 0; bottom: 0; left: 0;" ref="canvas_bad_draw_div" id="canvas_bad_draw_div">
              <canvas style="width:100%;z-index: 99" ref="canvas_bad" id="canvas_bad"></canvas>
            </div>

<!-- xmax: 427
xmin: 309
ymax: 278
ymin: 182 -->

            <!-- Below "works" but box is too small. And resizing breaks it -->
            <!-- <div style="border:dotted;border-color:green;width: 100%;position:absolute;top: 75px; right: 0; bottom: 0; left: 0;margin: auto;">
              <canvas @mouseover="adjustRec" @click="draw" style="z-index: 100;border:dotted;border-color:red" ref="canvas_draw" id="canvas_draw"></canvas>
            </div> -->


        </div>

        <div>
          <cv-button style="width:50%;margin-bottom:10px" type="default" v-on:click="capture">Capture Frame And Analyze</cv-button>
        </div>
        <div >
          <cv-button id="interval" style="width:30%;margin-right: 10px;" v-on:click="intervalCapture()">Start Analysis Of Feed</cv-button>
          <cv-button style="width:30%;margin: 0px 10px;" type="default" v-on:click="stopStream">Stop Analysis Of Feed</cv-button>
          <cv-button id="configure_interval" style="width:30%;margin-left: 10px" v-on:click="showModal({'name': 'configure-interval-modal'})">Set Interval Of Feed</cv-button>
        </div>

        <div>
          <cv-button style="width:50%;margin-bottom:10px" type="default" v-on:click="drawROI()">Draw ROI</cv-button>
        </div>
            <!-- <video muted loop controls @ended="restartStream()" style="width: 640px;height:480px;z-index: 5; " crossorigin="anonymous" ref="video" id="video" width="640" height="480" autoplay></video>
            <video muted loop controls @ended="restartStream()" style="width: 640px;height:480px;z-index: 0;position: absolute; left: 50%; transform: translate(-50%, 0); " crossorigin="anonymous" ref="remote_video" id="remote_video" width="640" height="480" autoplay></video>
            <canvas style="width: 640px;height:480px;z-index: 2000;position: absolute; left: 50%; transform: translate(-50%, 0);" crossorigin="anonymous" ref="stream_canvas" id="stream_canvas" width="640" height="480" ></canvas>
            <canvas style="z-index: 2000;position: absolute ; visibility: hidden" crossorigin="anonymous" ref="canvas" id="canvas" width="640" height="480" ></canvas> -->

          <!-- </div> -->
        <!-- </template> -->
        </cv-tile>
      </div>


      <!-- <template v-if="Object.keys(selectedModel).length > 0">
        <h5>{{selectedModel['name']}}</h5>
      </template> -->

      <div class="bx--col-lg-3" >
        <!-- <div> -->
          <div style="border:1px solid rgb(128, 201, 123); height:650px">
            <h5>Good Labels</h5>
            <p>
              found in {{Object.keys(inferencesByCategory['positive']).length}} images
            </p>
            <div style="height:70px;overflow-y:auto;">
              <template v-for="label in selected_good_labels">
                <cv-tag
                :label="label"
                kind="gray"
                ></cv-tag>
              </template>
            </div>

            <div style="display: grid; overflow-y:auto; grid-template-columns: auto auto;height:530px">
              <template v-for="inference in inferences">

                <template v-if="checkClasses(inference, selected_good_labels, 'positive').length > 0">
                  <cv-tile style="width:95%;height:120px" v-on:click.native="showModal({'name': 'show-inference', 'inference': inference})" :kind="inferenceTileKind">
                    <img style="width:98%;height:98%" :src=inference.canvas_url><img/>
                    <!-- Detected Objects: {{inference.classified.map( i => `${i.confidence} ${i.label}`).join('_')}} -->
                  </cv-tile>
                </template>
              </template>
            </div>
          </div>
      </div>
      <!-- </div> -->

      <div class="bx--col-lg-3" style="z-index:10;" >
          <div style="border:1px solid rgb(237, 43, 33); z-index:10;height:650px">
              <h5>Bad Labels</h5>
              <p>
                found in {{Object.keys(inferencesByCategory['negative']).length}} images
              </p>

              <div style="height:70px;overflow-y:auto;">
                <template v-for="label in selected_bad_labels">
                  <cv-tag
                  :label="label"
                  ></cv-tag>
                </template>
              </div>
              <div style="display: grid; overflow-y:auto; grid-template-columns: auto auto;height:530px">
                <template v-for="inference in inferences">
                  <!-- <template v-if="inference.classified.filter(value => selected_bad_labels.map(l => l.toLowerCase()).includes(value.label)).length > 0" > -->
                  <template v-if="checkClasses(inference, selected_bad_labels, 'negative').length > 0">
                    <!-- <cv-tile style="height:200px; width:250px" kind="clickable" theme=""> -->
                    <cv-tile style="width:95%;height:120px" v-on:click.native="showModal({'name': 'show-inference', 'inference': inference})"  :kind="inferenceTileKind">
                      <img style="width:98%;height:98%" :src=inference.canvas_url><img/>
                      <!-- Detected Objects: {{inference.classified.map( i => `${i.confidence} ${i.label}`).join('_')}} -->
                    </cv-tile>
                  </template>
                </template>
              </div>
          </div>
      </div>

      <div class="bx--col-lg-2">
        <!-- <cv-tile> -->
          <!-- <div style="top: 15%;position: absolute;margin:0;vertical-align: middle;"> -->
            <!-- <div style="height:200px">
              <template v-for="label in Object.keys(legend)">
                <div :style="'width:10px;height:10px;border: 3px solid;border-color: ' + legend[label]">
                </div>
                <p style="text-align:right">
                  {{label}}
                </p>
              </template>
            </div> -->
            <h5 style="justify-content: center; align-items: center;">Results by Category</h5>
            <div style="position:relative;left:-100px;z-index:0">
              <Plotly :data="plotlyData" :layout="plotlyConfig" :display-mode-bar="false"></Plotly>
            </div>

            <!-- <ccv-donut-chart style="padding: 10px;" :key="chartRedraw" id="donut_chart" ref="donut_chart"  :data='chartData' :options='chartOptions'></ccv-donut-chart> -->
      </div>
    </div>
  </div>

  <div class="bx--row" style="align-items: center; justify-content: center;margin-top:50px">
    <!-- <div class="bx--col-md-12">
      <ccv-donut-chart :key="chartRedraw" id="donut_chart" ref="donut_chart"  :data='chartData' :options='chartOptions'></ccv-donut-chart>
    </div> -->
    <div class="bx--col-md-4">
      <cv-data-table title="Alerts" :zebra=true :columns="['Type', 'Date', 'Classes', 'Priority']" :pagination="{ numberOfItems: Infinity, pageSizes: [5, 10, 15, 20, 25] }">
        <template v-if="use_htmlData" slot="data">
          <cv-data-table-row v-for="(row, rowIndex) in alerts" :key="`${rowIndex}`" :value="`${rowIndex}`" @click.native="showModal({'name': 'show-inference', 'inference': inferences[rowIndex]})">
            <cv-data-table-cell><input type="text" :value="row['type']" style="border: none; background: none; width: 100%;"/></cv-data-table-cell>
            <cv-data-table-cell><input type="text" :value="row['date']" style="border: none; background: none; width: 100%;"/></cv-data-table-cell>
            <cv-data-table-cell><input type="text" :value="row['classes']" style="border: none; background: none; width: 100%;"/></cv-data-table-cell>
            <cv-data-table-cell><input type="text" :value="row['priority']" style="border: none; background: none; width: 100%;"/></cv-data-table-cell>
          </cv-data-table-row>
        </template>
      </cv-data-table>
    </div>

    <div class="bx--col-md-8">
      <template v-if="inferences.length > 0">
        <div style=height:600px;overflow-y:auto;>
          <cv-data-table title="Inferences" :zebra=true :columns="['Type', 'Date', 'Classes', 'Model']" :pagination="{ numberOfItems: Infinity, pageSizes: [5, 10, 15, 20, 25] }">
            <template v-if="use_htmlData" slot="data">

                <cv-data-table-row v-for="(row, rowIndex) in inferences" :key="`${rowIndex}`" :value="`${rowIndex}`" @click.native="showModal({'name': 'show-inference', 'inference': inferences[rowIndex]})">
                   <cv-data-table-cell><input type="text" :value="row['analysis_type']" style="border: none; background: none; width: 100%;"/></cv-data-table-cell>
                   <cv-data-table-cell><input type="text" :value="parseDate(row['created_date'])" style="border: none; background: none; width: 100%;"/></cv-data-table-cell>
                   <cv-data-table-cell style="overflow-x:auto">
                     <template v-if="row['analysis_type'] == 'object_detection'">
                       <template v-for="c in row['classified']">
                         <cv-tag :label="c['label']" :type="gray"></cv-tag>
                       </template>
                     </template>
                     <template v-else-if="row['analysis_type'] == 'classification'">
                       <template v-for="c in row['classified']">
                         <cv-tag :label="c['name']" :type="gray"></cv-tag>
                       </template>
                     </template>
                     <template v-else>
                       "type doesn't match"
                     </template>
                   </cv-data-table-cell>
                   <cv-data-table-cell><input type="text" :value="selectedModelName" style="border: none; background: none; width: 100%;"/></cv-data-table-cell>
                 </cv-data-table-row>

             </template>
          </cv-data-table>
        </div>
      </template>
      <template v-else>
        <cv-data-table-skeleton
          :columns="['Type', 'Date', 'Classes', 'Model']"
          :rows=3
          title="Inferences"
          ></cv-data-table-skeleton>
      </template>
    </div>
  </div>

</div>
    <div>
      <modal name="upload-modal" height="auto" style="z-index: 3000;">
          <h2 align="center"> Upload File </h2>
          <div style="margin-left: auto; margin-right: auto;width: 75%; padding: 10px;">
            <cv-file-uploader
              :accept="['.mp4', '.jpg', '.jpeg', '.png']"
              :multiple=true
              ref="fileUploader">
            </cv-file-uploader>
          </div>
          <div>
            <cv-button @click="uploadFile() ; hideModal({name: 'upload-modal'})">Submit</cv-button>
          </div>
      </modal>

      <modal name="add-rule" height="auto" style="z-index: 3000;">
        {{alerts}}
        <h2 text-align="center">Configure Alerts</h2>
        <cv-form style="margin-left:20px;margin-right:20px" @submit.prevent="addAlert">
          <cv-text-input
            label="Title"
            v-model="alertTitle"
            >
          </cv-text-input>

          <cv-multi-select
            v-model="alertExistingLabels"
            :label="alertExistingLabels.join(',')"
            title="Existing Objects"
            selection-feedback="top-after-reopen"
            :inline=false
            :filterable=true
            :auto-filter=true
            :auto-highlight=true
            :options="good_labels">
          </cv-multi-select>

          <cv-multi-select
            v-model="alertMissingLabels"
            :label="alertMissingLabels.join(',')"
            :inline=false
            title="Missing Objects"
            selection-feedback="top-after-reopen"
            :filterable=true
            :auto-filter=true
            :auto-highlight=true
            :options="good_labels">
          </cv-multi-select>

          <!-- TODO, add multiple ROIs -->
          <!-- <cv-multi-select
            v-model="selected_labels"
            :label="selected_labels.join(',')"
            :inline=false
            title="Select ROI(s)"
            selection-feedback="top-after-reopen"
            :filterable=true
            :auto-filter=true
            :auto-highlight=true
            :options="drawnRois">
          </cv-multi-select> -->

          <!-- TODO, add actions -->
          <!-- <cv-select style="height:60px;margin-left:-50px; margin-top: -30px;" @change="setModel" v-model="selectedModelName" id="modelSelector" ref="modelSelector" theme=""
            label="Bind Action" :inline=false >
            <cv-select-option label="Select Action" value="" :disabled=true>Priority</cv-select-option>
            <cv-select-option v-for="action in actions"></cv-select-option>
          </cv-select> -->

          <cv-select style="height:60px;margin-left:-50px; margin-top: -30px;"
            v-model="alertPriority" ref="alertPrioritySelector" theme="" title="Bind Action" :hide-label=true :inline=false >
            <cv-select-option label="Set Priority" value="" :disabled=true>Priority</cv-select-option>
            <cv-select-option label="High" value="high">High</cv-select-option>
            <cv-select-option label="Medium" value="medium">Medium</cv-select-option>
            <cv-select-option label="Low" value="low">Low</cv-select-option>
          </cv-select>

          <cv-button style="margin-top:30px;margin-bottom:20px;margin-right:20px;float:right" v-on:click="hideModal({'name': 'add-rule'})">Confirm</cv-button>
        </cv-form>
      </modal>


      <modal name="add-action" height="auto" style="z-index: 3000;">
        <cv-form style="margin-left:20px;margin-right:20px" @submit.prevent="hideModal({name: 'add-action'})">
          <h2>Configure Actions</h2>
        <!-- <div> -->
          <cv-text-input
            v-model="actionTitle"
            label="Title">
          </cv-text-input>
        <!-- </div> -->
          <!-- Let do API calls to keep it simple -->
        <!-- <div> -->
          <cv-select style="height:60px;margin-left:-50px; margin-top: -30px;" @change="setModel" v-model="selectedModelName" id="modelSelector" ref="modelSelector" theme=""
            label="Method" :inline=false >
            <cv-select-option label="POST" value="POST">POST</cv-select-option>
            <cv-select-option label="GET" value="GET">GET</cv-select-option>
            <cv-select-option label="PUT" value="PUT">PUT</cv-select-option>
          </cv-select>
        <!-- </div> -->

        <!-- <div> -->
          <cv-select style="height:60px;margin-left:-50px; margin-top: -30px;" label="Bind Action"
            v-model="alertPriority" ref="alertPrioritySelector" theme="" title="Bind Action" :hide-label=true :inline=false >
            <cv-select-option label="Select Priority" value="" :disabled=true>Priority</cv-select-option>
            <cv-select-option label="High" value="high">High</cv-select-option>
            <cv-select-option label="Medium" value="medium">Medium</cv-select-option>
            <cv-select-option label="Low" value="low">Low</cv-select-option>
          </cv-select>
        <!-- </div> -->

          <!-- <cv-number-input
            style="margin-left:25%;margin-top:25px"
            label="Analysis Interval (Seconds)"
            v-model="interval"
            :step=cv_number_step
            :min=cv_number_min
            >
          </cv-number-input> -->
        <!-- <div> -->
          <cv-button style="margin-top:30px;margin-bottom:20px;margin-right:20px;float:right" v-on:click="hideModal({'name': 'configure-interval-modal'})">Confirm</cv-button>
        <!-- </div> -->
        </cv-form>
      </modal>


      <modal name="show-inference" height="auto" style="z-index: 4000;">
        <!-- <cv-tile kind="clickable" style="float:center"> -->
          <h2 align="center"> Inference </h2>
          <h5 align="center"> {{parseDate(inference.created_date)}} </h5>

          <!-- <img :src="url + inference['thumbnail_path']"/> -->
          <div style="width: 50%; margin: 0 auto;;">
            <canvas id="image_canvas" v-overlay-image="inference"></canvas>
          </div>
          <template v-if="Object.keys(inference).includes('classified')">
            <div style="margin:auto; width: 50%;margin-bottom:20px">
              <template v-if="inference['analysis_type'] == 'object_detection'" >
                <cv-data-table :data="[['Score', inference.classified[0].confidence], ['Class', inference.classified[0].label], ['Type', inference.analysis_type]]" ref="table"></cv-data-table>
              </template>
              <template v-else-if="inference['analysis_type'] == 'classification'" >
                <cv-data-table :data="[['Score', inference.classified[0].confidence], ['Class', inference.classified[0].name], ['Type', inference.analysis_type]]" ref="table"></cv-data-table>
              </template>
            </div>
          </template>
          <cv-button @click="hideModal({name:'show-inference'})">Close</cv-button>
        <!-- </cv-tile> -->
      </modal>

      <modal name="configure-interval-modal" height="auto" style="z-index: 3000;">
        <h2 align="center"> Configure Analysis Interval </h2>

        <!-- <cv-tile style="float:center"> -->
        <cv-form style="margin-left:20px;margin-right:20px" @submit.prevent="hideModal({name: 'configure-interval-modal'})">
          <cv-number-input
            style="margin-left:25%;margin-top:25px"
            label="Analysis Interval (Seconds)"
            v-model="interval"
            :step=cv_number_step
            :min=cv_number_min
            >
          </cv-number-input>

          <!-- <cv-checkbox
            style="margin-left:25%;margin-top:25px"
            label="loop"
            :checked=true
            v-model="loopVideo"
            >
          </cv-checkbox> -->
          <cv-button style="margin-top:30px;margin-bottom:20px;margin-right:20px;float:right" v-on:click="hideModal({'name': 'configure-interval-modal'})">Confirm</cv-button>
        </cv-form>
            <!-- </cv-tile> -->
      </modal>

      <modal name="configure-stream-modal" height="auto" style="z-index: 3000;">
        <h2 align="center"> Configure Stream </h2>
          <cv-form style="margin-left:20px;margin-right:20px" @submit.prevent="stream">
            <cv-text-input
              label="URL"
              placeholder="URL (Youtube or RTSP)"
              v-model="rtsp_url">
            </cv-text-input>
            <cv-text-input
              label="Port"
              v-model="rtsp_port"
              placeholder="Port">
            </cv-text-input>
            <cv-text-input
              label="Username"
              v-model="rtsp_username"
              placeholder="Username">
            </cv-text-input>

            <cv-text-input
              label="Password"
              v-model="rtsp_password"
              type="password"
              placeholder="Password">
            </cv-text-input>

            <!-- <cv-select label="Example select label">
              <cv-select-option disabled selected hidden>Choose an option</cv-select-option>
              <cv-select-optgroup label="Category 1">
                <cv-select-option value="cv-select-option1">cv-select-option 1</cv-select-option>
                <cv-select-option value="cv-select-option2">cv-select-option 2</cv-select-option>
              </cv-select-optgroup>
              <cv-select-optgroup label="Category 2">
                <cv-select-option value="cv-select-option3">cv-select-option 3</cv-select-option>
                <cv-select-option value="cv-select-option4">cv-select-option 4</cv-select-option>
              </cv-select-optgroup>
            </cv-select> -->
            <cv-button >Submit</cv-button>
          </cv-form>
      </modal>

      <modal name="view-configured-models" height="auto" style="z-index: 3000;">
        <h2>Configured Models</h2>
        {{JSON.stringify(this.$data.modelConfigs)}}
      </modal>


      <modal name="login-modal" height="auto" style="z-index: 3000;">

        <h2 align="center"> Login Maximo Visual Inspector </h2>
          <cv-form style="margin-left:20px;margin-right:20px" @submit.prevent="login">
            <cv-text-input
              label="URL"
              placeholder="URL"
              v-model="mviUrl">
            </cv-text-input>
            <cv-text-input
              label="Username"
              v-model="username"
              placeholder="Username">
            </cv-text-input>
            <cv-text-input
              label="Password"
              v-model="password"
              type="password"
              placeholder="Password">
            </cv-text-input>
            <cv-button style="margin-bottom:10px;margin-top:10px;float:right">Submit</cv-button>
          </cv-form>
      </modal>
    </div>

    <!-- TODO draw rect -->
    <!-- <vue-button type="default" v-on:click="showModal({'name': 'view-image'})">Image</vue-button> -->
    <div style="margin: 0; position: absolute; top: 50%; left: 50%;z-index: 3000;" >
      <modal name="view-image" height="auto" >
        <h2 align="center"> Image </h2>
        <div style="width: 50%; margin: 0 auto;">
          <canvas id="image_canvas" v-overlay-image="inference"></canvas>
        </div>
        <div>
          <vue-button type="default" v-on:click="hideModal({'name': 'view-image'})">Cancel</vue-button>
        </div>
      </modal>
    </div>




    <modal name="configure-model-modal" height="430px" style="z-index: 3000;" >
      <h2 align="center" style="margin-top:20px"> Configure Model </h2>
      <cv-form style="margin-left:20px;margin-right:20px" @submit.prevent="updateModelConfig">
          <div style="height:80px;position: relative">
            <cv-select style="height:60px;margin-left:-50px; margin-top: -30px;" @change="setModel" v-model="selectedModelName" id="modelSelector" ref="modelSelector" theme="" label="Select Model" :hide-label=true >
              <cv-select-option label="Select a Model" value="" :disabled=true>Select a Model</cv-select-option>
              <template v-for="model in models">
                <cv-select-option :label="model.name" :value="model.name">{{model.name}}</cv-select-option>
              </template>
            </cv-select>
          </div>

          <template v-if="selectedModel != {}">
            <div style="margin-top:10px">
              <cv-multi-select
                v-model="selected_good_labels"
                :label="selected_good_labels.join(',')"
                :inline=false
                helper-text="Good labels"
                selection-feedback="top-after-reopen"
                :filterable=true
                :auto-filter=true
                :auto-highlight=true
                :options="good_labels">
              </cv-multi-select>
            </div>
            <div style="margin-top:10px;margin-bottom:10px">
              <cv-multi-select
                v-model="selected_bad_labels"
                :label="selected_bad_labels.join(',')"
                :inline=false
                helper-text="Bad labels"
                selection-feedback="top-after-reopen"
                :filterable=true
                :auto-filter=true
                :auto-highlight=true
                :options="good_labels">
              </cv-multi-select>
            </div>
            <cv-slider
              label="Confidence Threshold (%)"
              :min="0"
              :max="100"
              :value="70"
              :step="1"
              v-model="threshold"
              min-label="0"
              max-label="100"></cv-slider>
          </template>
          <div>
            <cv-button  style="margin-top:20px;margin-bottom:20px;float:right" >Select</cv-button>
          </div>
        </cv-form>

    </modal>
  </div>


</template>

<script>
  import 'vfc/dist/vfc.css'
  import {
    Input
  } from 'vfc'
  import {
    Form
  } from 'vfc'
  import {
    FormItem
  } from 'vfc'
  import {
    Button
  } from 'vfc'

  export default {
    name: 'app',
    created() {
      var Youtube = new this.$Youtube()
      var player
    },

    directives: {
      overlayImage: function(canvasElement, inference, url, opacity=1.0) {
          // Get canvas context
          var ctx = canvasElement.getContext("2d");
          var can_w = 640 // ctx.canvas.width
          var can_h = 480 // ctx.canvas.height
          var colors = ['red', 'blue', 'green', 'yellow', 'purple']
          var heatmap = new Image
          heatmap.id = "heatmap"
          console.log('_id')
          var i = new Image
          i.id = "image"
          i.onload = function() {
              console.log("creating thumbnail canvas image")
              // define image and canvas overlay dimensions
              var img_w = 640 //this.width
              var img_h = 480 //this.height
              var can_w = 640 //ctx.canvas.width //width //= 400
              var can_h = 480 //ctx.canvas.height //height //= 500
              ctx.canvas.width = 640
              ctx.canvas.height = 480

              var hRatio = img_w / inference.value.width;
              var vRatio = img_h / inference.value.height  ;

              // var hRatio = img_w / canvasElement.width;
              // var vRatio = img_h / canvasElement.height  ;
              console.log(`img_h ${img_h} img_w ${img_w} can_w ${can_w} can_h ${can_h}`)
              // var vRatio = 1
              // var hRatio = 1

              console.log(`img_h ${img_h} img_w ${img_w} can_w ${ctx.canvas.width} can_h ${ctx.canvas.height}`)
              console.log(`hRatio ${hRatio} vRatio ${vRatio}`)
              var ratio = Math.min ( hRatio, vRatio )
              console.log('ratio')
              console.log(ratio)
              ctx.globalAlpha = 0.9;
              var centerShift_x = 0//( canvasElement.width - hRatio*img_w ) / 2;
              var centerShift_y = 0//( canvasElement.height - vRatio*img_h ) / 2;
              ctx.drawImage(i, 0, 0, img_w, img_h)//, centerShift_x,centerShift_y,img_w, img_h ) //, 100, 100 * imageObj.height / imageObj.width)
              if (inference.value['analysis_type'] == 'object_detection') {
                console.log("drawing boxes")
                inference.value['classified'].map( (o, idx) => {
                  var tl_x = o['xmin'] * hRatio
                  var tl_y = (o['ymin'] * vRatio)
                  var w = (o['xmax'] - o['xmin']) * hRatio
                  var h = (o['ymax'] - o['ymin']) * vRatio
                  ctx.lineWidth = "6";
                  ctx.strokeStyle = colors[idx % colors.length];
                  ctx.fillStyle = colors[idx % colors.length];
                  console.log(`xmin ${o['xmin']}, ymax ${o['ymax']}, hRatio ${hRatio} vRatio ${vRatio}`)
                  console.log(`w ${w}, h ${h}, tl_x ${tl_x}, tl_y ${tl_y} ` )
                  ctx.beginPath()
                  ctx.font = "30px Arial";
                  ctx.fillText(o['label'], (o['xmin'] * hRatio) + 20, (o['ymin'] * vRatio) + 20)
                  ctx.rect( tl_x, tl_y, w, h )
                  ctx.stroke()
                })
              } else {
                heatmap.onload = function() {
                    console.log("drawing heatmap")
                    var img_w = this.width
                    var img_h = this.height
                    var hRatio = canvasElement.width / img_w    ;
                    var vRatio = canvasElement.height / img_h  ;
                    var ratio  = Math.max ( hRatio, vRatio )
                    ctx.globalAlpha = 0.4;
                    ctx.drawImage(heatmap, 0, 0, img_w, img_h, 0,0,img_w*ratio, img_h*ratio ) //, 100, 100 * imageObj.height / imageObj.width)
                    console.log("dims")
                    console.log(this.width)
                    console.log(this.height)
                    // TODO, add text based on class
                    // canvasElement.width = this.width
                    // canvasElement.height = this.height
                }
                heatmap.style.opacity = 0.1
                heatmap.style['z-index'] = 100
                console.log("inference['value']")
                console.log(inference['value'])
                heatmap.src = inference['value']['heatmap']
              }
          }
          console.log("loading thumbnail")
          // i.src = inference['value']['url'] + inference['value']['thumbnail_path']
          i.src = inference.value.canvas_url
          console.log(`canvasElement.width ${canvasElement.width}` )
          console.log(`canvasElement.height ${canvasElement.height}` )
      }
    },

    data() {
      return {
        previewRect: false,
        previewCursor: false,
        alertPriority: "",
        actionTitle: "",
        alerts: [],
        // TODO, set Backend Proxy URL and PAIV URL seperate
        mviUrl: (localStorage['paiv_url'] || process.env.VUE_MVI_URL),
        proxyServerIp: process.env.VUE_APP_PROXY_IP || `${window.location.protocol}//${window.location.hostname}`,
        proxyServerPort: process.env.VUE_APP_PROXY_PORT || 3000,
        alerts: [],
        instructionsROI: "",
        stillImages: [],
        alertTitle: "",
        alertExistingLabels: [],
        alertMissingLabels: [],
        edge: true, //process.env.VUE_APP_EDGE || false,
        drawing: false,
        recStart: {},
        drawnRois: [],
        recEnd: {},
        recBoundingBoxes: {},
        roiWidth: 0,
        cv_number_step: 1,
        cv_number_min: 1,
        cv_slider_max: 100,
        cv_slider_min: 0,
        cv_slider_value: 70,
        cv_slider_step: 1,
        selected_labels: [],
        roiHeight: 0,
        loadingText: "",
        loadingState: "none",
        form: {
          function: '',
          args: ''
        },
        legend: {},
        chartRedraw: 0,
        localFileSrc: "",
        loopVideo: true,
        gray: "gray",
        videoPlaying: false,
        interval: 1,
        analyzingFrames: true,
        use_htmlData: true,
        countGenerated: false,
        args: [],
        products: [],
        counts: {},
        inferences: [],
        renderInferences: [],
        inference_data: {},
        fields: [],
        selectedModelName: '',
        inference_rows: [],
        inference_rows_original: [],
        inference_rows_filtered: [],
        query: '',
        tableData: [],
        selectedModel: {},
        threshold: "20",

        inferencesByCategory: {
          positive: {},
          negative: {}
        },
        inferenceTileKind: "clickable",
        plotlyConfig: {
          // title: "Results by Category",
          hole: 0.4,
          height: 500,
          width: 500,
          x: -50,
          legend: {
            x: 0,
            y: -400
          },

          automargin: true
        },
        plotlyData: [{
          values: [1],
          labels: ["None"],
          // textposition: "inside",
          // textinfo: "label",
          // xanchor:'left',
          // yanchor:'center',
          type: 'pie',
          marker: {
            colors: []
          }
        }],
        chartData: [
        		{ "group": "placeholder", "value": 100}
        ],
        chartOptions: {
      		// "title": "Results by Category",
      		"resizable": false,
          "legend": {
            "position": "top",
            "alignment": "left",
            "truncation": {
              "threshold": 200,
              "numCharacter": 200
            },
            // "height": "300px"
          },
          // "data": {
            // "loading": true
          // },
          "color": {
            "scale": {"placeholder": "rgb(220,220,220)"}
          },
          // "style:" {
          //
          // },
          "pie": {
              "tooltip": {
                // "showTotal": true,
                "truncation": {
                  "threshold": 200,
                  "numCharacter": 200
                },
              },
              "truncation": {
                "threshold": 200,
                "numCharacter": 200
              },
              "alignment": "center"
      		},
      		"donut": {
              "tooltip": {
                // "showTotal": true,
                "truncation": {
                  "threshold": 200,
                  "numCharacter": 200
                },
              },
              "truncation": {
                "threshold": 200,
                "numCharacter": 200
              },
      				"center": {
      						"label": "Objects/Classes Detected"
      				},
              "alignment": "center"
      		},
          "width": "300px",
          "height": "500px",
          // "color": {
          //     "scale": {
          //         "Conductor Damaged": "blue",
          //         "Dataset 2": "red"
          //     } // Other data groups would use default colors
          // },

        },

        // token: (localStorage['token'] || ''),
        // user_fields: [],
        // user_type: '',
        // user_input: [],
        captures: [],
        // player: {},
        video: {},
        canvas: {},
        input: [],
        func: '',
        title: '',
        src: '',
        selectedInference: '',
        models: [],
        files: [],
        selected_good_labels: [],
        selected_bad_labels: [],
        filenames: [],
        inference: {},
        inferenceDetails: {},
        lineGraphData: [],
        circleGraphData: [],
        activeFilters: {},
        sortAscending: true, //
        username: (localStorage['paiv_user'] || process.env.VUE_APP_USER),
        password: (localStorage['paiv_password'] || process.env.VUE_APP_PASSWORD),
        css: {
          table: {
            tableWrapper: '',
            tableHeaderClass: 'fixed',
            tableBodyClass: 'fixed',
            tableClass: 'ui blue selectable unstackable celled table',
            loadingClass: 'loading',
            ascendingIcon: 'blue chevron up icon',
            descendingIcon: 'blue chevron down icon',
            ascendingClass: 'sorted-asc',
            descendingClass: 'sorted-desc',
            sortableIcon: 'grey sort icon',
            handleIcon: 'grey sidebar icon'
          }
        },
        selected_compare: "",
        selected_header: "",
        value: "",
        filter_header: "",
        filter_value: "",
        filter_compare_type: "",
        search_query: "",
        inference_results: {},
        csv_type: "",
        good_labels: [],
        bad_labels: [],
        categories: [],
        cv_tag_label: "label",
        cv_tag_kind: "gray",
        modelConfigs: {},
        mobile_inference_headers: [
          "Thumbnail",
          "DataSetName",
          'Class',
          'Score',
          'Type',
          'FormattedDate',
          'Location'
        ],
        mapping: {
          "Class": "Metadata0",
          "Score": "Metadata1",
          "Heatmap/Boxes": "Metadata4",
          "ImageURL": "Thumbnail"
        },
        // inference_headers: [],
        inference_headers: [
          "ImageURL",
          "InferenceType",
          "Heatmap/Boxes",
          'Class',
          'Score',
          'Time'
        ],
        lineGraphLayout: {
          title: 'Objects Time Series',
          xaxis: {
            title: 'Seconds',
            showgrid: false,
            zeroline: false,
            tickmode: 'linear'
          },
          yaxis: {
            title: 'Objects',
            showline: false,
            dtick: 1
          }
        },
        rtsp_url: '',
        rtsp_port: '',
        rtsp_username: '',
        rtsp_password: '',
        isStreaming: false,
        streamingType: "" // rtsp or youtube
      }
    },
    components: {
      Form,
      FormItem,
      [Input.name]: Input,
      [Button.name]: Button
    },
    beforeMount() {
      // this.getInferences()
      this.$data.token = localStorage.getItem('token')
      this.$data.mviUrl = localStorage.getItem('mviUrl')
      let recaptchaScript = document.createElement('script')
      recaptchaScript.setAttribute('src', `${this.$data.proxyServerIp}:${this.$data.proxyServerPort}/scripts/jsmpeg.min.js`)
      document.head.appendChild(recaptchaScript)

    },
    mounted() {
      this.video = this.$refs.video;
      // this.$refs.video.addEventListener('ended', this.restartStream())
      // this.$refs.remote_video.addEventListener('ended', this.restartStream())
      if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
              console.log(`stream ${stream}`)
              console.log(`this.video ${this.video}`)
              this.video.srcObject=stream;
              this.video.play();
          });
      }
      if (this.$data.token || (this.$data.edge && this.$data.mviUrl) ) {
        console.log("previous token loaded")
        // TODO, add regex to check token. also add last time token was refreshed
        this.getModels()
      }

      if (localStorage.getItem('modelConfigs')) {
        console.log("loading model configs")
        // this.$data.modelConfigs = JSON.parse(localStorage.getItem('modelConfigs'))
      }

      var canvas = this.$refs.canvas_draw
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight

      var topMargin = canvas.offsetTop + "px"
      this.adjustDrawCanvas(canvas.offsetWidth, canvas.offsetHeight, topMargin)

      let debug = true
      if (debug) {
        this.$refs.canvas_bad_draw_div.style.border = 'dotted'
        this.$refs.canvas_bad_draw_div.style.borderColor = 'red'

        this.$refs.canvas_good_draw_div.style.border = 'dotted'
        this.$refs.canvas_good_draw_div.style.borderColor = 'green'

        this.$refs.canvas_draw.style.border = 'dotted'
        this.$refs.canvas_draw.style.borderColor = 'blue'

        this.$refs.videoHeader.style.border = 'dotted'

      }
      // document.getElementById('canvas_draw').style.height
      // this.$refs.canvas_draw.style.height = this.$refs.canvas.style.height
      // this.$refs.canvas_draw.style.width = this.$refs.canvas.style.width

      // this.getInferenceDetails();
    },
    methods: {
      addAlert() {
        let alert = {
          alertTitle: this.$data.alertTitle,
          alertExistingLabels: this.$data.alertExistingLabels,
          alertMissingLabels: this.$data.alertMissingLabels,
          alertPriority: this.$data.alertPriority
        }
        console.log("adding alert")
        console.log(alert)
        this.$data.alerts.push(alert)
      },
      adjustRec(ev) {
        console.log("adjusting rectangle")
        var canvas = this.$refs.canvas_draw
        var width = canvas.offsetWidth
        var height = canvas.offsetHeight
        var ctx = canvas.getContext("2d")
        var ctxCoords = canvas.getBoundingClientRect()
        var mouseX = ev.clientX - ctxCoords.left  // ev.layerX //width - ev.
        var mouseY = ev.clientY - ctxCoords.top

        console.log(`mouseX ${mouseX}`)
        console.log(`mouseY ${mouseY}`)

      },
      hover(ev) {
        //
        var canvas = this.$refs.canvas_cursor
        console.log("hovering canvas")

        // canvas.width = canvas.offsetWidth
        // canvas.height = canvas.offsetHeight
        var ctx = canvas.getContext("2d")
        var ctxCoords = canvas.getBoundingClientRect()
        var mouseX = ev.clientX - ctxCoords.left  // ev.layerX //width - ev.
        var mouseY = ev.clientY - ctxCoords.top


        if (false) { // (this.$data.drawing) {
          console.log("previewing rectangle")
          // ctx.arc(mouseX, mouseY, 2, 0, 2 * Math.PI);

          ctx.clearRect(0,0, canvas.width, canvas.height)
          ctx.beginPath();

          let recStartX = this.$data.recStart['x']
          let recStartY = this.$data.recStart['y']

          /*
          if (recStartY > mouseY) {
            var yStart = recStartY
            var yEnd = mouseY
          } else {
            var yStart = mouseY
            var yEnd = recStartY
          }

          if (recStartX > mouseX) {
            var xStart = recStartX
            var xEnd = mouseX
          } else {
            var xStart = mouseX
            var xEnd = recStartX
          }
          let recWidth = xEnd - xStart
          let recHeight = yEnd - yStart
          */

          //
          // ctx.scale(-1, 1)
          // console.log(`xStart ${xStart} yStart ${yStart}`)
          console.log(`mouseX ${mouseX} mouseY ${mouseY}`)

          let recWidth = mouseX - recStartX
          let recHeight = mouseY - recStartY
          console.log(`recWidth ${recHeight} recHeight ${recHeight}`)
          ctx.rect(recStartX, recStartY, recWidth, recHeight)
          ctx.stroke();
          console.log("drew preview rectangle")
        } else if (this.$data.previewCursor) {
          console.log("updating cursor")
          ctx.clearRect(0,0, canvas.width, canvas.height)
          ctx.beginPath();
          ctx.arc(mouseX, mouseY, 2, 0, 2 * Math.PI);
          ctx.stroke();
        }

      },

      drawROI() {
        console.log("user clicked draw roi")
        this.$data.instructionsROI = "Click point on video stream to begin drawing ROI"
        var canvas = this.$refs.canvas_cursor
        var ctx = canvas.getContext("2d")
        ctx.font = "16px Arial";
        ctx.fillStyle = "white";
        ctx.fillText("Click to begin drawing", canvas.offsetWidth / 2, 5)
        ctx.stroke()
        this.$data.previewCursor = true
        // ctx.beginPath();
        // ctx.arc(mouseX, mouseY, 5, 0, 2 * Math.PI);
        // ctx.stroke();

        // this.$refs.canvas_draw.
      },
      startRectangle() {
        console.log("starting rectangle")
      },
      endRectangle() {
        console.log("ending rectangle")
      },
      draw(ev) {
        this.$data.drawing = ! this.$data.drawing
        console.log(ev)
        console.log("----drawing----")
        var canvas = this.$refs.canvas_draw
        // canvas.width = canvas.offsetWidth
        // canvas.height = canvas.offsetHeight
        var width = canvas.offsetWidth
        var height = canvas.offsetHeight
        this.$data.roiWidth = width
        this.$data.roiHeight = height
        // TODO, this breaks the inference modal view, removing for now
        // canvas.width = canvas.offsetWidth
        // canvas.height = canvas.offsetHeight
        var ctx = canvas.getContext("2d")
        var ctxCoords = canvas.getBoundingClientRect()
        console.log(`coords \n\nctxCoords.left ${ctxCoords.left} \nctxCoords.right ${ctxCoords.right} \ntop ${ctxCoords.top} \nbottom ${ctxCoords.bottom} `)
        // var mouseX = ev.layerX //clientX
        // var mouseY = ev.layerY //clientY
        console.log(`width ${width} height ${height}`)
        console.log(`ev.pageX ${ev.pageX} ev.offsetX ${ev.offsetX} `)
        console.log(`ev.pageY ${ev.pageY} ev.offsetY ${ev.offsetY} `)
        console.log(`ev.layerX ${ev.layerX} ev.layerY ${ev.layerY} `)
        console.log(`ev.clientX ${ev.clientX} ev.clientY ${ev.clientY} `)
        console.log(`ev.screenX ${ev.screenX} ev.screenY ${ev.screenY} `)

        var xRatio = this.$refs.canvas_draw.width
        var yRatio = this.$refs.canvas_draw.height
        // ctx.beginPath();
        // ctx.rect(10, 10, 20, 20)
        // ctx.stroke();


        var mouseX = ev.clientX - ctxCoords.left  // ev.layerX //width - ev.
        var mouseY = ev.clientY - ctxCoords.top

        // var mouseX = ev.pageX - ev.offsetX
        // var mouseY = ev.pageY - ev.offsetY

        // var mouseX = ev.pageX - ctxCoords.left  // ev.layerX //width - ev.
        // var mouseY = ev.pageY - ctxCoords.top

        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 5, 0, 2 * Math.PI);
        ctx.stroke();

        console.log(`mouseX ${mouseX}`)
        console.log(`mouseY ${mouseY}`)
        // start new rectangle

        if (! this.$data.drawing) {
          console.log(`---- starting new rectangle at points ${mouseX} ${mouseY}`)
          ctx.clearRect(0,0,width, height)
          // ctx.beginPath();
          this.$data.recStart = {'x': mouseX, 'y': mouseY}
          // ctx.rect(20, 20, 100, 100);
        // end rectangle
        } else {
          console.log(`---- ending rectangle at points ${mouseX} ${mouseY}`)
          this.$data.recEnd = {'x': mouseX, 'y': mouseY}
          // calculate bounding boxes
          let minX = Math.min(this.$data.recEnd['x'], this.$data.recStart['x'])
          let maxX = Math.max(this.$data.recEnd['x'], this.$data.recStart['x'])
          let minY = Math.min(this.$data.recEnd['y'], this.$data.recStart['y'])
          let maxY = Math.max(this.$data.recEnd['y'], this.$data.recStart['y'])
          this.$data.recBoundingBoxes = {
            xmin: minX,
            xmax: maxX,
            ymin: minY, // remember in canvas, y starts from top, so it is technically inverted
            ymax: maxY
          }
          ctx.strokeStyle = "blue";
          let recWidth = maxX - minX
          let recHeight = maxY - minY
          console.log(`minX ${minX} maxX ${maxX}`)
          console.log(`minY ${minY} maxY ${maxY}`)
          console.log(`recWidth ${recWidth} recHeight ${recHeight}`)
          ctx.rect(minX, minY, recWidth, recHeight)
          ctx.stroke();
        }
      },
      showTooltip(ev) {
        console.log(ev)
      },
      printColors() {
        // var c = this.$refs.donut_chart

        // /*
        // */

        // console.log(c.getFillColor())
        // color: {"scale": {"dsf": "ff7e00"}}
      },
      genLineData() {
        // inferencesByCategory['negative']
        // Object.keys(inferencesByCategory['negative']).map( (id) => {
        //   inferencesByCategory['negative'][id]
        // })

        // [created_date]

        // {
    		// 		"group": "Dataset 1",
    		// 		"key": "Qty",
    		// 		"value": 65000
    		// },

        // this.$data.inferences.map((inf) => {
        //   this.checkClasses(inf, this.$data.selected_good_labels).length
        // })
      },
      parseDate(date) {
        var parsedDate = Date.parse(d)
        return `${parsedDate.getYear()}/${parsedDate.getMonth()}/${parsedDate.getDay()} ${parsedDate.getHours()}:${parsedDate.getMinutes()}:${parsedDate.getSeconds()}`

      },
      mergeImagesToVideo(stillImages, formData) {
        // this.$data.stillImages
        let options = {
          method: "POST",
          body: formData
        }
        let url = `${this.$data.proxyServerIp}:${this.$data.proxyServerPort}/mergeframes`
        console.log(url)
        fetch(url, options).then( (res) => {
          res.blob().then( (vid) => {
             console.log("received merged video")
             let localUrl = URL.createObjectURL(vid)
             this.$refs.remote_video.src = localUrl
             console.log(localUrl)
          })
        })
      },
      adjustDrawCanvas(vidWidth, vidHeight, topMargin) {
        // var vidWidth = that.$refs.remote_video.offsetWidth
        // var vidHeight = that.$refs.remote_video.offsetHeight
        // var topMargin = that.$refs.remote_video_div.offsetTop + "px"

        // that.$refs.canvas_draw.width = vidWidth
        // that.$refs.canvas_draw.height = vidHeight
        // document.getElementById('canvas_draw_div').style.top
        console.log(`vidWidth ${vidWidth} vidHeight ${vidHeight}`)
        this.$refs.canvas_draw_div.style.top = topMargin
        this.$refs.canvas_good.width = vidWidth
        this.$refs.canvas_bad.width = vidWidth
        this.$refs.canvas_good_draw_div.height = vidHeight
        this.$refs.canvas_bad_draw_div.height = vidHeight
        this.$refs.canvas_good_draw_div.style.top = topMargin
        this.$refs.canvas_bad_draw_div.style.top = topMargin

      },
      uploadFile() {
        this.$data.streamingType = "file"
        this.$data.isStreaming = true
        this.$refs.video.style.visibility = "hidden"
        this.$refs.remote_video.style.visibility = "visible"
        this.$refs.remote_video.style['z-index'] = 2000
        this.$data.videoPlaying = true


        var formData = new FormData()

        var files = this.$refs.fileUploader.internalFiles
        var stillImages = []
        files.map( (file, idx) =>  {
          console.log(file)
          let fileType = file.file.type
          let isImage = ((fileType.includes('png')) || (fileType.includes('jpg')) || (fileType.includes('jpeg')))
          if (isImage) {
            console.log("handling still image")
            console.log(file)
            let localUrl = window.URL.createObjectURL(file.file)
            console.log(localUrl)
            console.log(file)
            this.$data.localFileSrc = localUrl
            // this.$refs.remote_video.poster = localUrl
            // this.$data.stillImages.push(file.file)
            stillImages.push(file.file)
            formData.append(`file${idx}`, file.file, file.file.name)
            if (idx == (files.length - 1) ) {
              console.log("merging still images")
              // post still images to backend to create video/slideshow
              this.mergeImagesToVideo(stillImages, formData)
            }
          } else {
            console.log("video uploaded, playing")
            let localUrl = window.URL.createObjectURL(file.file)
            this.$data.localFileSrc = localUrl
            this.$refs.remote_video.src = localUrl
          }
        })

        var that = this;
        // adjust size of canvas
        this.$refs.remote_video.onloadeddata = function() {
          console.log("remote video loaded, adjusting drawing canvas")
          // that.$refs.canvas_draw.offsetWidth = that.$refs.remote_video.offsetWidth
          // that.$refs.canvas_draw.offsetHeight = that.$refs.remote_video.offsetHeight
          var vidWidth = that.$refs.remote_video.offsetWidth
          var vidHeight = that.$refs.remote_video.offsetHeight
          var topMargin = that.$refs.remote_video_div.offsetTop + "px"
          console.log(that.$refs.remote_video.offsetHeight)
          that.$refs.canvas_draw.width = vidWidth
          that.$refs.canvas_draw.height = vidHeight

          // document.getElementById('canvas_draw_div').style.top
          console.log(`vidWidth ${vidWidth} vidHeight ${vidHeight}`)
          that.$refs.canvas_draw_div.style.top = topMargin

          that.$refs.canvas_good.width = vidWidth
          that.$refs.canvas_bad.width = vidWidth


          that.$refs.canvas_good_draw_div.height = vidHeight
          that.$refs.canvas_bad_draw_div.height = vidHeight
          that.$refs.canvas_good_draw_div.style.top = topMargin
          that.$refs.canvas_bad_draw_div.style.top = topMargin

          that.$refs.canvas_cursor.width = vidWidth
          that.$refs.canvas_cursor.height = vidHeight
          that.$refs.canvas_cursor_div.style.top = topMargin

          // that.$refs.canvas_draw.offsetWidth = that.$refs.remote_video.offsetWidth
          // that.$refs.canvas_draw.offsetHeight = that.$refs.remote_video.offsetHeight

        }

      },
      restartStream() {
        console.log("end event triggered, restarting stream")
        console.log("this.$data.videoPlaying")
        console.log(this.$data.videoPlaying)
        if ((this.$data.videoPlaying) && (this.$data.streamingType == 'file')) {
          console.log('restarting stream')
          // this.uploadFile()
          console.log(this.$refs.fileUploader.internalFiles)
          this.$refs.remote_video.src = this.$data.localFileSrc
        }
        else if ((this.$data.videoPlaying) && (this.$data.streamingType == 'youtube')) {
          this.stream()
        }
        else if ((this.$data.videoPlaying) && (this.$data.streamingType == 'rtsp')) {
          this.stream()
        } else {
          console.log("stream stopped by user")

        }
      },
      stream() {
        // var Youtube = new this.$Youtube()
        // console.log("Youtube")
        // console.log(Youtube)
        // return
        this.hideModal({name: "configure-stream-modal"})
        var url = `${this.$data.proxyServerIp}:${this.$data.proxyServerPort}/stream`
        var payload = {
          url: this.$data.rtsp_url,
          port: this.$data.rtsp_port,
          username: this.$data.rtsp_username,
          password: this.$data.rtsp_password,
          action: "start"
        }

        var options = {
          method: "POST",
          body: JSON.stringify(payload),
          headers: {
            'Content-Type': 'application/json'
          }
        }

        this.$data.videoPlaying = true
        console.log("starting stream")
        console.log("set this.$data.videoPlaying")
        console.log(this.$data.videoPlaying)

        console.log(options)
        fetch(url, options).then((res) => {
          if ((this.$data.rtsp_url.toLowerCase().includes('youtube')) || (this.$data.rtsp_url.includes('you.tu'))) {
            console.log("loading youtube")
            console.log(`res ${res}`)
            this.$data.streamingType = "youtube"
            this.$data.isStreaming = true
            // this.$refs.video.style.visibility = "hidden"
            this.$refs.remote_video.style.visibility = "visible"
            this.$refs.remote_video.pause()
            this.$refs.remote_video.src = ""
            res.json().then( (res) => {
              console.log(res)
              console.log(`setting vid stream ${res.url}`)
              // this.$refs.remote_video.src = res.url
              //
              this.$refs.remote_video.src = `${this.$data.proxyServerIp}:${this.$data.proxyServerPort}/ytstream`
              this.$refs.remote_video.load()
              // adjusting drawing canvas
              this.$refs.remote_video.loadeddata = function() {
                console.log("remote video loaded, adjusting drawing canvas")
                var vidWidth = that.$refs.remote_video.offsetWidth
                var vidHeight = that.$refs.remote_video.offsetHeight
                var topMargin = that.$refs.remote_video_div.offsetTop + "px"
                console.log(that.$refs.remote_video.offsetHeight)
                that.$refs.canvas_draw.width = vidWidth
                that.$refs.canvas_draw.height = vidHeight
                // document.getElementById('canvas_draw_div').style.top
                console.log(`vidWidth ${vidWidth} vidHeight ${vidHeight}`)
                that.$refs.canvas_draw_div.style.top = topMargin
                that.$refs.canvas_good.width = vidWidth
                that.$refs.canvas_bad.width = vidWidth
                that.$refs.canvas_good_draw_div.height = vidHeight
                that.$refs.canvas_bad_draw_div.height = vidHeight
                that.$refs.canvas_good_draw_div.style.top = topMargin
                that.$refs.canvas_bad_draw_div.style.top = topMargin

              }

            })
          } else {
            // TODO, confirm draw still works here
            console.log("stream started")
            this.$data.isStreaming = true
            this.$refs.stream_canvas.style.height = "360px"
            this.$refs.stream_canvas.style.offsetHeight = "360px"
            this.$refs.stream_canvas.style.visibility = 'visible'
            this.$refs.canvas.style.visibility = 'hidden'
            this.$refs.video.style.visibility = 'hidden'
            this.$refs.video.style.height = "0px"
            this.$data.streamingType = "rtsp"

            var proxyIp = this.$data.proxyServerIp
            var wsPort = 6004
            if (proxyIp) {
              var wsEndpoint = `ws://${proxyIp}:${wsPort}`.replace('http://', '').replace('https://', '')
            } else {
              var wsEndpoint = `ws://localhost:${wsPort}`
            }
            this.player = new JSMpeg.Player(wsEndpoint, {
              canvas: document.getElementById('stream_canvas'),
              disableGl: true
            })
            var vidWidth = this.$refs.stream_canvas.offsetWidth
            var vidHeight = this.$refs.stream_canvas.offsetHeight
            var topMargin = this.$refs.stream_canvas.offsetTop + "px"
            this.$refs.canvas_draw.width = vidWidth
            this.$refs.canvas_draw.height = vidHeight
            // document.getElementById('canvas_draw_div').style.top
            console.log(`vidWidth ${vidWidth} vidHeight ${vidHeight}`)
            this.$refs.canvas_draw_div.style.top = topMargin
            this.$refs.canvas_good.width = vidWidth
            this.$refs.canvas_bad.width = vidWidth
            this.$refs.canvas_good_draw_div.height = vidHeight
            this.$refs.canvas_bad_draw_div.height = vidHeight
            this.$refs.canvas_good.height = vidHeight
            this.$refs.canvas_bad.height = vidHeight

            this.$refs.canvas_good_draw_div.style.top = topMargin
            this.$refs.canvas_bad_draw_div.style.top = topMargin

          }

        }).catch( err => console.log(`starting stream error ${err} `))
      },
      stopStream(){


        var canvas = this.$refs.canvas_draw
        var ctx = canvas.getContext("2d")
        ctx.clearRect(0,0,canvas.width, canvas.height)

        var url = `${this.$data.proxyServerIp}:${this.$data.proxyServerPort}/stream`
        var options = {
          method: "POST",
          body: JSON.stringify({
            action: "stop"
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        }
        this.$data.videoPlaying = false
        this.$data.loadingText = ""
        this.$data.loadingState = "loaded"
        this.$refs.stream_canvas.style.visibility = 'hidden'
        // this.$refs.stream_canvas.style.height = '0px'
        this.$refs.remote_video.style.visibility = 'hidden'
        // this.$refs.canvas.style.visibility = 'visible'
        this.$refs.video.style.visibility = 'visible'
        this.$refs.video.style.height = "480px"

        fetch(url, options).then((res) => {
          console.log("stopping stream")
          this.$data.isStreaming = false
          if (this.player) {
            console.log(this.player)
            this.player.stop()
          }
        }).catch( err => console.log(`getting models error ${err} `))
      },
      getCount() {
        var type = this.$data.inferences[0]['analysis_type']
        if (type == 'classification') {
          console.log("getting classification labels")
          var labels = this.$data.inferences.map( (inf) =>  {
            return inf.classified.map(res => res.name)
          })
          console.log(labels)
        } else {
          console.log("getting obj detection labels")
          var labels = this.$data.inferences.map( (inf) =>  {
            return inf.classified.map(res => res.label)
          })
        }

        var all_labels = [].concat.apply([],labels)
        var uniqLabels = new Set(all_labels)
        console.log(`uniqLabels ${uniqLabels}`)
        console.log(`all_labels ${all_labels}`)
        // { "apple":1, "banana": 3 }
        var counts = {}
        all_labels.map( (l, idx) => {
          if (Object.keys(counts).includes(l)) {
            counts[l] += 1
          } else {
            counts[l] = 1
          }
          if (idx == (all_labels.length - 1)) {
            this.$data.counts = counts
            this.$data.countGenerated = true
            this.$data.plotlyData[0].labels = Object.keys(counts)
            this.$data.plotlyData[0].values = Object.values(counts)
            this.genChartData(counts)
            // console.log("done counting ")
            // console.log(counts)
            // return counts
          }
        })
      },
      genChartData(counts) {
        console.log("updating chart data")
        var updatedChartData =  Object.keys(counts).map( (c) => { return {group: c, value: counts[c] }} )
        console.log(`updatedChartData`)
        console.log(updatedChartData)
        this.$data.chartData = updatedChartData
        this.$data.chartRedraw += 1
      },
      getStats() {
      },
      loadModelConfig(modelName) {
        console.log(`checking configs for ${modelName}`)
        console.log(JSON.stringify(this.$data.modelConfigs))
        if ( Object.keys(this.$data.modelConfigs).includes(modelName)) {
          console.log("loading model config")
          this.$data.selected_good_labels = this.$data.modelConfigs[modelName]['good']
          this.$data.selected_bad_labels = this.$data.modelConfigs[modelName]['bad']
        }
      },
      updateModelConfig() {
        //if ( Object.keys(this.$data.selectedModel).length > 0 ) {
        console.log("in updateModelConfig")
        // selected_good_labels = ["Bird Guards","Conductor Damaged","Conductor Good"]
        // let colors = {}
        // var good_labels_populated = false
        // var bad_labels_populated = false
        // selected_good_labels.map( (label) =>  {return { label: `rgb(0, ${Math.floor((Math.random() * 200) + 1) + 55},0)` }})
        this.$data.selected_good_labels.map( (label, idx) => {
          // colors[label] = `rgb(0, ${Math.floor((Math.random() * 200) + 1) + 55},0)`
          let color = `rgb(0, ${Math.floor((Math.random() * 200) + 1) + 55},0)`
          this.$data.chartOptions.color.scale[label] = color
          console.log(`updating good label ${idx} ${label}`)
          this.$data.legend[label] = color
          if (idx == (this.$data.selected_good_labels.length - 1) ) {
            // this.$refs.donut_chart.forceUpdate()
            console.log("good labels colors added")
            console.log(this.$data.chartOptions.color.scale)
            // this.$data.chartRedraw += 1
            // good_labels_populated = true
          }
          console.log(this.$refs.donut_chart)
        })
        this.$data.selected_bad_labels.map( (label, idx) => {
          // colors[label] = `rgb(${Math.floor((Math.random() * 200) + 1) + 55}, 0, 0)`
          console.log(`updating bad label ${idx} ${label}`)
          let color = `rgb(${Math.floor((Math.random() * 200) + 1) + 55}, 0, 0)`
          this.$data.chartOptions.color.scale[label] = color
          this.$data.legend[label] = color
          if (idx == (this.$data.selected_bad_labels.length - 1) ) {
            // this.$data.chartRedraw += 1
            // this.$refs.donut_chart.forceUpdate()
            console.log("bad labels colors added")
            console.log(this.$data.chartOptions.color.scale)
            // bad_labels_populated = true
          }
          console.log(this.$refs.donut_chart)
        })
        // if (bad_labels_populated && good_labels_populated) {
          // console.log("updating chart colors")
          // console.log(colors)
          // this.$data.chartOptions.color.scale[] = colors
        // }
        //// stash in localStorage
        if (this.$data.selectedModelName) {
          console.log("updating config")
          console.log(`good labels ${this.$data.selected_good_labels}`)
          let modelName = this.$data.selectedModelName
          let modelConfig = {
              positive: this.$data.selected_good_labels,
              negative: this.$data.selected_bad_labels
          }
          this.$data.modelConfigs[modelName] = modelConfig
          console.log("saved new modelconfigs")
          console.log(this.$data.modelConfigs)
          localStorage.setItem('modelConfigs', JSON.stringify(this.$data.modelConfigs))
        }
        this.hideModal({'name': 'configure-model-modal'})
      },
      setModel(modelName) {
        console.log(this.$refs.modelSelector)
        var modelName = this.$data.selectedModelName
        console.log(modelName)
        var filteredModels = this.$data.models.filter(m => m.name == modelName)
        console.log( `${filteredModels.length} matching models found}` )
        if (filteredModels.length > 0) {
          console.log("model found, selecting")
          console.log(filteredModels[0])
          // name, label, value
          var multiSelectOpts = filteredModels[0].categories.map( category => {
           return {
                    name: category.category_name,
                    label: category.category_name,
                    value: category.category_name
                  }
          })
          console.log(multiSelectOpts)
          this.$data.good_labels = multiSelectOpts
          this.$data.bad_labels = multiSelectOpts
          console.log(`multiSelectOpts ${JSON.stringify(multiSelectOpts)}`)
          this.$data.selectedModel = filteredModels[0]
          this.loadModelConfig(modelName)
        }
      },
      checkInference(inference, labels) {
        var results = inference.classified
        var labels_lowered = labels.map(l => l.toLowerCase())
        var threshold = 75
        var matches = results.filter(value => labels_lowered.includes(value.label) )
      },

      sortClasses(type, inferences) {

      },
      checkClasses(inference, inputLabels, type=null) {
        // inference.classified.filter(value => selected_good_labels.map(l => l.toLowerCase()).includes(value.label)).length > 0
        var labels = inputLabels.map(l => l.toLowerCase())
        // if typeof(inference.classified) == 'object'
        // var inference = inf.classified
        console.log("inference")
        console.log(inference)

        console.log("inference.classified")
        console.log(inference.classified)

        console.log(`inference.analysis_type ${inference.analysis_type}`)
        if (inference.analysis_type == 'object_detection') {
          console.log("detecting object")
          console.log(`labels ${labels} ${JSON.stringify(inference.classified)}`)
          // var threshold = 0.80
          var filtered_inference = inference.classified.filter( value =>
            (labels.includes(value.label.toLowerCase()) && ( (value.confidence * 100) > this.$data.threshold)) )
          console.log(`filtered_inference ${filtered_inference} `)
          // this.$data.selected_labels[type] = filtered_inference
          if (filtered_inference.length > 0) {
            this.$data.inferencesByCategory[type][inference['_id']] = inference
          }
          return filtered_inference

        } else {
          console.log("checking classification labels")
          console.log("labels")
          console.log(labels)
          var filtered_inference = inference.classified.filter( value =>
            (labels.includes(value.name.toLowerCase()) && ( (value.confidence * 100) > this.$data.threshold)) )
          console.log(filtered_inference)
          if (filtered_inference.length > 0) {
            this.$data.inferencesByCategory[type][inference['_id']] = inference
          }
          // this.$data.selected_labels[type] = filtered_inference
          return filtered_inference
          /*
          // 1.2
          if (labels.includes( Object.keys(inference.classified)[0].toLowerCase() ) ) {
            console.log("label matches")
            return [inference]
          } else {
            console.log("label doesn't match")
            return []
          }
          */
        }

      },
      t_o() {
        // window.setTimeout( this.capture(), 1000 * seconds)
          // let cap = this.capture
          var that = this
          return new Promise(resolve => {
            console.log(`running interval after ${1000 * that.$data.interval}`)
            setTimeout(() => {
              resolve(that.capture());
            }, 1000 * that.$data.interval) })
      },
      recursiveTo() {
        var that = this
        return new Promise(resolve => {
          console.log(`running interval after ${1000 * that.$data.interval}`)
          if (this.$data.loadingState == "loading") {
              console.log("analyzing")
              that.t_o().then(a =>
                resolve(that.recursiveTo())
              )
          } else {
                console.log("stopping")
                resolve()
          }

        })
      },
      intervalCapture() {
        console.log("starting interval")
        var seconds = 9999
        var that = this
        this.$data.loadingState = "loading"
        this.$data.loadingText = "Capturing Frame every " + this.$data.interval + " seconds"
        this.recursiveTo()
        // funcs = [...Array(seconds).keys()].map( s => that.t_o(s) )
      },
      getCanvasWidth() {
        console.log("getting canvas width")
        console.log(this.$refs.canvas.width)
        return this.$refs.canvas.width
      },
      getCanvasHeight() { return this.$refs.canvas.height},
      capture() {
          if ( Object.keys(this.selectedModel).length == 0) {
            console.log("no model selected")
            // return
          }
          var that = this
          var date = new Date(Date.now())
          console.log(`capturing at ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`)
          if ((this.$data.isStreaming) && (this.$data.streamingType == 'rtsp')) {
            console.log("sampling rtsp feed")
            this.canvas = this.$refs.stream_canvas;
            var width = this.canvas.offsetWidth
            var height = this.canvas.offsetHeight
            var context = this.canvas.getContext("2d").drawImage(this.$refs.stream_canvas, 0, 0, width, height);
            var canvas_url = this.canvas.toDataURL('image/png') //document.getElementById('stream_canvas').toDataURL('png')
          } else if ((this.$data.isStreaming) && ((this.$data.streamingType == 'youtube') || (this.$data.streamingType == 'file')  ) ) {
            console.log("sampling youtube video")
            this.canvas = this.$refs.canvas;
            var width = this.canvas.offsetWidth
            var height = this.canvas.offsetHeight
            var context = this.canvas.getContext("2d").drawImage(this.$refs.remote_video, 0, 0, width, height);
            // var image = context.drawImage(this.$refs.remote_video, 0, 0, width, height);
            var canvas_url = this.canvas.toDataURL("image/png")

          } else { // webcam
            console.log("sampling webcam video")
            this.$refs.stream_canvas.style.visibility = 'hidden'
            // this.$refs.canvas.style.visibility = 'visible'
            this.canvas = this.$refs.canvas;
            var width = this.canvas.offsetWidth
            var height = this.canvas.offsetHeight
            var context = this.canvas.getContext("2d").drawImage(this.video, 0, 0, width, height);
            // var image = context.drawImage(this.video, 0, 0, width, height);
            var canvas_url = this.canvas.toDataURL("image/png")
          }
          // console.log(image)
          this.captures.push(canvas_url);
          /*
          var i = new Image();
          i.onload = function(){
           console.log("base")
           console.log( i.width+", "+i.height );
           console.log( i.naturalWidth+", "+i.naturalHeight );
          };

          i.src = canvas_url;
          */


          // TODO! Make canvas url match with width and height
          // console.log(`captured canvas url dims`)
          // console.log(`width ${width} height ${height}`)

          // console.log(`width ${this.canvas.width} height ${this.canvas.height}`)

          // var draw_canvas = this.$refs.canvas_draw;
          // console.log(`draw_canvas.width ${draw_canvas.width} draw_canvas.height ${draw_canvas.height}`)

          this.canvas.toBlob(function(blob){ that.submitInference(blob, canvas_url, width, height)}, 'image/png'); // JPEG at 95% quality

          // this.canvas.toBlob(
          //   blob => this.submitInference(blob, canvas_url)
          // )
          // this.submitInference(canvas_url)
      },
      show() {
           this.$refs.view.method('show')();
      },
      dragOverHandler(ev) {
        console.log('File(s) in drop zone');
        ev.preventDefault();
      },
      dropHandler(ev) {
        console.log('File(s) dropped');
        // hideModal({'name': 'upload-modal'})
        // Prevent default behavior (Prevent file from being opened)
        ev.preventDefault();
        this.$data.filenames = []
        if (ev.dataTransfer.items) {
          // Use DataTransferItemList interface to access the file(s)
          for (var i = 0; i < ev.dataTransfer.items.length; i++) {
            // If dropped items aren't files, reject them
            if (ev.dataTransfer.items[i].kind === 'file') {
              var file = ev.dataTransfer.items[i].getAsFile();
              var s = file.text().then( (text) => {
                this.$data.inference_rows = []
                var rows = text.split(/\r\n|\n/)
                var h = rows[0].split(',');
                // if ( h.length > 10 ) {
                //   csv_type = "Mobile"
                // }
                // this.$data.inference_headers = h
                var min_row_length = 20 // TODO, added here in case of empty row / trailing spaces in csv.
                var row_data = {}
                var h_obj = h.map( (h) => { row_data[h] = "" } )
                if (h_obj) {
                  rows.slice(1).map( (r, r_idx) => {
                      var row_elements = r.split(',')
                      var row_data_copy = Object.create(row_data)
                      row_elements.map( (c, idx) => {
                        console.log(`adding column data ${c} ${idx}`)
                        row_data_copy[h[idx]] = c
                        // console.log( `${idx} / ${row.length - 1}` )

                        if ((idx == (row_elements.length - 1)) && (JSON.stringify(row_data_copy).length > min_row_length)) {
                          console.log(`appending row ${r_idx}`)
                          console.log(JSON.stringify(row_data_copy))
                          this.$data.inference_rows.push(row_data_copy)
                          this.$data.inference_rows_original.push(row_data_copy)
                        }
                      })
                  })
                }
              } )
              console.log('... file[' + i + '].name = ' + file.name);
              console.log("printing text")
              this.$data.filenames.push(file.name)
              this.$data.files.push(file)
             }
            }
          } else {
              // Use DataTransfer interface to access the file(s)
              for (var i = 0; i < ev.dataTransfer.files.length; i++) {
                console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
              }
            }
      },
      addFilter() {
        var filter_header = this.$data.filter_header
        var filter_compare_type = this.$data.filter_compare_type
        var filter_value = this.$data.filter_value
        // query column based on options
        // valid options are "less than", "greater than", "equal to", "contains"
        console.log("adding filter")
        console.log(filter_header, filter_compare_type, filter_value)
        var ts = Date.now()
        var filter = {}
        this.$data.activeFilters[ts] = [filter_header, filter_compare_type, filter_value] //.push( filter )
        if (filter_compare_type == 'less') {
          var filtered_rows = this.$data.inference_rows_original.filter(row => parseFloat(row[filter_header]) < parseFloat(filter_value))
          this.$data.inference_rows_filtered = filtered_rows
          console.log(`reduced to ${filtered_rows.length}`)
        } else if (filter_compare_type == 'greater') {
          var filtered_rows = this.$data.inference_rows_original.filter(row => parseFloat(row[filter_header]) > parseFloat(filter_value))
          this.$data.inference_rows_filtered = filtered_rows
          console.log(`reduced to ${filtered_rows.length}`)
        } else if (filter_compare_type == 'equal') {
          var filtered_rows = this.$data.inference_rows_original.filter(row => row[filter_header] == filter_value)
          this.$data.inference_rows_filtered = filtered_rows
          console.log(`reduced to ${filtered_rows.length}`)
        } else if (filter_compare_type == 'contains') {
          var filtered_rows = this.$data.inference_rows_original.filter(row => row[filter_header].includes(filter_value))
          this.$data.inference_rows_filtered = filtered_rows
          console.log(`reduced to ${filtered_rows.length}`)
          // console.log("filtered to " this.$data.inference_rows_filtered)
        }
      },
      filterRows(){
        var filters = this.$data.activeFilters
        var filterFuncs = []
        var filtered_rows_total = this.$data.inference_rows_original
        Object.keys(filters).map( (ts, idx) => {
          // filters[ts]
          var filter_header = filters[ts][0]
          var filter_compare_type = filters[ts][1]
          var filter_value = filters[ts][2]

          var filter_less = (a, b) => a < b
          var filter_more = (a, b) => a > b
          var filter_equal = (a, b) => a == b
          var filter_contains = (a, b) => a.includes(b)

          // const filteredData = filters.reduce((d, f) => d.filter(f) , data)
          // if (filter_compare_type == 'less') {
          //   filterFuncs.append( filter_less() )
          // }

          if (filter_compare_type == 'less') {
            filtered_rows_total = filtered_rows_total.filter(row => parseFloat(row[filter_header]) < parseFloat(filter_value))
            if (idx == (filters.length - 1)) {
              this.$data.inference_rows = filtered_rows_total
            }
            // this.$data.inference_rows_filtered = filtered_rows
            // console.log(`reduced to ${filtered_rows.length}`)
          } else if (filter_compare_type == 'greater') {
            filtered_rows_total = filtered_rows_total.filter(row => parseFloat(row[filter_header]) > parseFloat(filter_value))
            if (idx == (filters.length - 1)) {
              this.$data.inference_rows = filtered_rows_total
            }
            // this.$data.inference_rows_filtered = filtered_rows
            // console.log(`reduced to ${filtered_rows.length}`)
          } else if (filter_compare_type == 'equal') {
            filtered_rows_total = filtered_rows_total.filter(row => row[filter_header] == filter_value)
            if (idx == (filters.length - 1)) {
              this.$data.inference_rows = filtered_rows_total
            }
            // this.$data.inference_rows_filtered = filtered_rows
            // console.log(`reduced to ${filtered_rows.length}`)
          } else if (filter_compare_type == 'contains') {
            filtered_rows_total = filtered_rows_total.filter(row => row[filter_header].includes(filter_value))
            if (idx == (filters.length - 1)) {
              this.$data.inference_rows = filtered_rows_total
            }
            // this.$data.inference_rows_filtered = filtered_rows
            // console.log(`reduced to ${filtered_rows.length}`)
            // console.log("filtered to " this.$data.inference_rows_filtered)
          }
        })
      },
      removeFilter(f){
        console.log(f)
        // this.$data.activeFilters[ts]
        // var matchingFilter = this.$data.activeFilters.filter(filter => { (filter[0] == f[0]) && (filter[1] == f[1]) && (filter[2] == f[2]) } )
        var aFilters = this.$data.activeFilters
        Object.keys(aFilters).map( (filter) => {
          if ((aFilters[filter][0] == f[0]) && (aFilters[filter][1] == f[1]) && (aFilters[filter][2] == f[2])) {
            console.log(`found matching filter, removing {filter}`)
            // this.$data.activeFilters.pop(aFilters)
            delete this.$data.activeFilters[filter]
            console.log(this.$data.activeFilters)
            var filtered_rows = this.$data.inference_rows_original.filter(row => row[filter_header].includes(filter_value))
            this.$data.inference_rows = filtered_rows
            // this.$data.inference_rows_filtered = filtered_rows
          }
        } )
      },

      parseDate(d) {
        var dateObj = (new Date(Date.parse(d)))
        // var r = date.getMonth() + date.getDay() + date.getYear()
        var date = `${dateObj.getMonth()}/${dateObj.getDay()}/${dateObj.getFullYear()}`
        var time = dateObj.toLocaleString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: true
        })
        return `${date} ${time}`
      },
      /*
      getModels() {
        //TODO, check for model classes
        if ( ! this.$data.url) {
          console.log("url not set yet")
          return
        }
        var options = {
          method: "GET",
          headers: {
            "X-Auth-Token": this.$data.token,
          }
        }
        if (this.$data.edge) {
          var url = `${this.$data.proxyServerIp}:${this.$data.proxyServerPort}/proxyget` + "/model-info"

        } else {
          var url = `${this.$data.proxyServerIp}:${this.$data.proxyServerPort}/proxyget` + "/api/trained-models"
        }
        // var url = `${this.$data.proxyServerIp}:${this.$data.proxyServerPort}/proxyget/api/trained-models`
        // proxy needed for cors
        fetch(url, options).then((res) => {
          console.log("models received")
          console.log("res")
          console.log(res)
          res.json().then((models) => {
            // if ( models != {} ) {
            if (this.$data.edge) {
              this.$data.models = [models]
              this.$data.allmodels = [models]
            } else {
              this.$data.models = models.filter( (m) => m.deployed == '1'  )
              this.$data.allmodels = models
            }            // }
          }).catch( err => console.log(`parsing model json error ${err} `) )
        }).catch( err => console.log(`getting models error ${err} `) )
      },
      */
      drawRectStream(labelInRoi, width, cls, recWidth, recHeight,objectXMin, objectYMin) {
         return new Promise( (resolve, reject) => {
           console.log("draw rect promise")

           if (this.$data.selected_bad_labels.includes( cls['label'])) {
             var canvas = this.$refs.canvas_bad
             var ctx = canvas.getContext("2d")
             ctx.beginPath();
             console.log("bad")
             var strokeStyle = "red";
           } else if (this.$data.selected_good_labels.includes( cls['label'])) {
             var canvas = this.$refs.canvas_good
             var ctx = canvas.getContext("2d")
             ctx.beginPath();
             console.log("good")
             var strokeStyle = "green";
           } else {
             console.log("neutral")
             var strokeStyle = "yellow";
             return
           }
           console.log(`label type ${strokeStyle}`)
           if (labelInRoi) {
             console.log("in roi")
             var lineWidth = 2;
             // ctx.shadowColor = '#99ff66';
             // ctx.shadowBlur = 20;
           } else {
             console.log("NOT in roi")
             var lineWidth = 1;
           }

           if (lineWidth && strokeStyle) {
             ctx.lineWidth = lineWidth
             ctx.strokeStyle = strokeStyle
             console.log(`drawing rectangle around object ${ctx.strokeStyle} ${ctx.lineWidth} ${cls['label']}`)

             ctx.rect(objectXMin, objectYMin, recWidth, recHeight)
             ctx.stroke();
             ctx.font = "16px Arial";
             ctx.fillStyle = strokeStyle;
             ctx.fillText(cls['label'], objectXMin, objectYMin)

             resolve()
           }
        })
      },
      submitInference(image, canvas_url, width=null, height=null) {
        console.log(`width ${width} height ${height}`)
        // post to powerai when user clicks "upload"

        let model = this.$data.selectedModel
        console.log(`image type ${typeof image}`)
        console.log(`submitting inference to model ${model['name']}`)
          var headers = {
            "X-Proxy-URL": this.$data.mviUrl  //this.$data.url
          }

          var blobAppended = true
          var formData = new FormData()
          formData.append('blob', image, 'image.png')
          if (blobAppended) {
            var options = {
              method: "POST",
              body: formData,
              headers: headers
            }
            if (this.$data.edge) {
              console.log("posting to edge endpoint")
              var url = `${this.$data.proxyServerIp}:${this.$data.proxyServerPort}/proxypost/inference`
            } else {
              console.log("posting to MVI endpoint")
              var url = `${this.$data.proxyServerIp}:${this.$data.proxyServerPort}/proxypost` + "/api/dlapis/" + model['_id']
            }
            console.log(`url ${url}`)
            fetch(url, options).then((res) => {
              console.log("inference uploaded")
              // TODO, show a "loading" gif until inference is fully uploaded?
              res.json().then((result) => {
                var canvas = this.$refs.canvas_good
                var ctx = canvas.getContext("2d")
                ctx.clearRect(0,0,canvas.width, canvas.height)

                var canvas = this.$refs.canvas_bad
                var ctx = canvas.getContext("2d")
                ctx.clearRect(0,0,canvas.width, canvas.height)

                // cases
                // append image inference (object or classification)
                // handle array of images (classification)
                // upload video, no need to append inference results
                if (Object.keys(headers).includes('X-Fragment-Video')) {
                  // process multiple images as video (classification only)
                  // want to be able to overlay heatmaps on video

                  var inference = {
                    _id: result[0].id,
                    analysis_type: "video_classifier", //"image",
                    created_date: (new Date().toJSON()),
                    thumbnail_path: result[0]['imageUrl'], //'/uploads' + endpoint,
                    status: result[0]['result'],
                    filename: "capture_" + (new Date().toJSON()), //filename,
                    model_id: this.$data.selectedModel['_id'],
                    heatmap: result.map( r => r.heatmap ), //heatmap,
                    classified: result.map( r => r.classified ), //result['classified'],
                    url: this.$data.url,
                    width: width,
                    height: height
                  }
                  console.log("appending video classification inference ")
                  console.log(inference)
                  // this.$data.inferences.push(inference)

                  this.$data.inferences.unshift(inference)

                } else if (Object.keys(result).includes('classified')) {
                  // process single image
                  this.$data.inferenceDetails[result.imageMd5] = {}

                  if (Object.keys(result).includes("imageUrl")) {
                    var endpoint = result.imageUrl.split('/uploads')[1]
                    var filename = endpoint.split('/').slice(-1)[0]
                  } else {
                    var endpoint = null
                    var filename = null
                  }
                  // var labels = Array.from(new Set(result.classified.map((c) => c.label)))

                  // if classified is "array", we're receiving results of "object detection"
                  // if (Array.isArray(result.classified)) {
                  // ['usage'] == 'cic' // classification
                  // ['usage'] == 'cod' // object detection
                  var canvas = this.$refs.canvas_draw
                  var ctx = canvas.getContext("2d")
                  if (Array.isArray(result.classified) && (result.classified.length < 1) ) {
                    console.log("skipping inference, no results detected")
                    console.log("clearing boxes")
                    // ctx.clearRect(0,0,canvas.width, canvas.height)
                    return
                  }
                  console.log(this.$data.selectedModel.usage)
                  if (this.$data.selectedModel.usage == 'cod') { // TODO, see if there are other object detection models
                    // object detection

                    var analysis_type = 'object_detection'
                  } else {
                    // classification
                    var analysis_type = 'classification'
                    // get labels
                    var labels = Array.from(new Set(Object.keys(result.classified).map((c) => c)))
                    labels.map((l) => {
                      var r = Object.keys(result.classified).filter(c => c.label == l)
                      var count = r.length //Array.from((new Set(r))).length
                      console.log("count for " + l)
                      this.$data.inferenceDetails[result.imageMd5][l] = {"count": count, "score": result.classified[l]}
                      // this.$data.inferenceDetails[result.imageMd5]['score'] = result.classified[l]
                    })

                    // get heatmap
                    if (Object.keys(result).includes('heatmap')) {
                      var heatmap = result['heatmap']
                    } else {
                      var heatmap = ""
                    }
                  }

                  // TODO, curretly have to store this locally since pictures are not returned with other inferences. Should investigate where these images/metadata are stored, and possibly cache results


                  // if (analysis_type == 'classification') {
                  // result.classified.filter( inf => inf.name == '_negative_' )
                  // }
                  if (JSON.stringify(result['classified']).includes('_negative_')) {
                    return
                  }
                  var date = (new Date().toJSON())
                  var inference = {
                    _id: result.imageMd5,
                    analysis_type: analysis_type, //"image",
                    canvas_url: canvas_url,
                    created_date: date,
                    thumbnail_path: '/uploads' + endpoint,
                    status: result['result'],
                    filename: "capture_" + (new Date().toJSON()), //filename,
                    model_id: result['webAPIId'],
                    heatmap: heatmap,
                    percent_complete: 100,
                    classified: result['classified'],
                    url: this.$data.url,
                    width: width,
                    height: height
                  }
                  console.log("appending inference ")
                  console.log(inference)
                  this.$data.inferences.push(inference)


                  var recBoundingBoxes = this.$data.recBoundingBoxes
                  // /*
                  // detect if object in ROI
                  let minX = Math.min(this.$data.recEnd['x'], this.$data.recStart['x'])
                  let maxX = Math.max(this.$data.recEnd['x'], this.$data.recStart['x'])
                  let minY = Math.min(this.$data.recEnd['y'], this.$data.recStart['y'])
                  let maxY = Math.max(this.$data.recEnd['y'], this.$data.recStart['y'])
                  let recWidth = maxX - minX
                  let recHeight = maxY - minY

                  if ( (inference["classified"].length > 0) && this.$data.recBoundingBoxes)  {
                    // ctx.clearRect(0,0,width, height)
                    // this.$data.lastDraw = new Date.now()
                    // var canvas = this.$refs.canvas_draw

                    // width is hardcoded as 300
                    // height is 150
                    console.log(`width ${width} height ${height}`)
                    console.log(`canvas.offsetWidth ${canvas.offsetWidth} canvas.offsetHeight ${canvas.offsetHeight}`)
                    var wRatio = canvas.offsetWidth / width
                    var vRatio = canvas.offsetHeight / height
                    ctx.clearRect(0,0,canvas.offsetWidth, canvas.offsetHeight)

                    // draw bounding rectangle
                    ctx.strokeStyle = "green";

                    ctx.beginPath();
                    ctx.rect(minX, minY, recWidth, recHeight)
                    ctx.stroke();

                    // draw ROI
                    // console.log("redrawing roi")
                    // ctx.beginPath();
                    // ctx.lineWidth = 3
                    // ctx.rect(objectXMin, objectYMin, recWidth, recHeight)
                    // ctx.stroke();

                    // lets gen a ratio based on the real width/height (offset)
                    var results = []
                    var goodInferences = []
                    var badInferences = []
                    inference["classified"].map( (cls, idx) => {
                      var objectYMax = cls['ymax'] * vRatio
                      var objectYMin = cls['ymin'] * vRatio
                      var objectXMax = cls['xmax'] * wRatio
                      var objectXMin = cls['xmin'] * wRatio

                      var recBoxYMin = this.$data.recBoundingBoxes['ymin'] //* vRatio
                      var recBoxYMax = this.$data.recBoundingBoxes['ymax'] //* vRatio
                      var recBoxXMin = this.$data.recBoundingBoxes['xmin'] //* wRatio
                      var recBoxXMax = this.$data.recBoundingBoxes['xmax'] //* wRatio
                      console.log(`checking ROI ${cls['label']}`)
                      console.log("object coords")
                      console.log(`ymax: ${objectYMax} ymin ${objectYMin} xmax ${objectXMax} xmin ${objectXMin} `)
                      console.log("recBoundingBoxes")
                      console.log(this.$data.recBoundingBoxes)
                      // console.log(`ymax: ${recBoundingBoxes['ymax']} ymin ${recBoundingBoxes['ymin']} xmax ${recBoundingBoxes['xmax']} xmin ${recBoundingBoxes['xmin']} `)
                      console.log("this.$data.roiWidth")
                      console.log(this.$data.roiWidth)
                      console.log("this.$data.roiHeight")
                      console.log(this.$data.roiHeight)
                      console.log('-----')
                      console.log("recBoxYMin <= objectYMax <= recBoxYMax")
                      console.log(`${recBoxYMin} <= ${objectYMax} <= ${recBoxYMax}`)
                      console.log(`${recBoxYMin <= objectYMax <= recBoxYMax}`)
                      console.log("recBoxYMin <= objectYMin <= recBoxYMax")
                      console.log(`${recBoxYMin} <= ${objectYMin} <= ${recBoxYMax}`)
                      console.log(`${recBoxYMin <= objectYMin <= recBoxYMax}`)
                      console.log("recBoxXMin <= objectXMax <= recBoxYMax")
                      console.log(`${recBoxXMin} <= ${objectXMax} <= ${objectXMax}`)
                      console.log(`${recBoxXMin <= objectXMax <= objectXMax}`)
                      console.log("recBoxXMin <= objectXMin <= recBoxXMax")
                      console.log(`${recBoxXMin} <= ${objectXMin} <= ${recBoxXMax}`)
                      console.log(`${recBoxXMin <= objectXMin <= recBoxXMax}`)
                      console.log('-----')
                      var labelInRoi = (( recBoxYMin <= objectYMax && objectYMax <= recBoxYMax ) ||
                                       ( recBoxYMin <= objectYMin && objectYMin <= recBoxYMax )) &&
                                       (( recBoxXMin <= objectXMax && objectXMax <= recBoxXMax ) ||
                                       ( recBoxXMin <= objectXMin && objectXMin <= recBoxXMax ))

                      let recWidth = Math.abs(objectXMin - objectXMax)
                      let recHeight = Math.abs(objectYMin - objectYMax)
                      console.log("recWidth recHeight")
                      console.log(`${recWidth}, ${recHeight}`)
                      console.log("objectXMin objectYMin")
                      console.log(`${objectXMin} ${objectYMin}`)

                      if ( true) {
                            // (( this.$data.recBoundingBoxes['ymax'] <= objectYMax <= this.$data.recBoundingBoxes['ymin'] ) ||
                            //  ( this.$data.recBoundingBoxes['ymin'] <= objectYMin <= this.$data.recBoundingBoxes['ymax'] )) &&
                            // let minX = Math.min(this.$data.recEnd['x'], this.$data.recStart['x'])
                            // let minY = Math.min(this.$data.recEnd['y'], this.$data.recStart['y'])

                            // draw label

                            // if (this.$data.selected_bad_labels.includes( cls['label'])) {  //(labelInRoi) {
                            //   console.log("appending bad promise")
                            //   badInferences.push( this.drawRectStream(labelInRoi, width, cls, recWidth, recHeight))
                            // } else {
                            //   console.log("appending good promise")
                            //   goodInferences.push( this.drawRectStream(labelInRoi, width, cls, recWidth, recHeight))
                            // }

                          // TODO, let user click on pie chart to filter down
                          // TODO, only focus on ROI

                          //

                           let recWidth = Math.abs(objectXMin - objectXMax)
                           let recHeight = Math.abs(objectYMin - objectYMax)
                           this.drawRectStream(labelInRoi, width, cls, recWidth, recHeight, objectXMin, objectYMin)
                           if (this.$data.selected_bad_labels.includes( cls['label']) && labelInRoi ) {
                              var alert = {
                                "type": "Bad Label in ROI",
                                "classes": cls['label'],
                                "priority": "High",
                                "date": date
                              }
                              console.log(`adding alert ${alert['type']}`)
                              this.$data.alerts.push(alert)
                            } else if (this.$data.selected_bad_labels.includes( cls['label']) && (!labelInRoi)) {
                              var alert = {
                                "type": "Bad Label outside of ROI",
                                "classes": cls['label'],
                                "priority": "High",
                                "date": date
                              }
                              console.log(`adding alert ${alert['type']}`)
                              this.$data.alerts.push(alert)
                            } else if (this.$data.selected_good_labels.includes( cls['label']) && (labelInRoi)) {
                              var alert = {
                                "type": "Good Label in ROI",
                                "classes": cls['label'],
                                "priority": "Low",
                                "date": date
                              }
                              console.log(`adding alert ${alert['type']}`)
                              this.$data.alerts.push(alert)
                            } else {
                              console.log("no alerts")
                            }
                            console.log(this.$data.alerts)
                            // results.push( {
                            //   "labelInRoi": labelInRoi,
                            //   "width": width,
                            //   "cls": cls,
                            //   "recWidth": recWidth,
                            //   "recHeight": recHeight
                            // })

                            // debugging
                            // ctx.fillText(`objectXMin ${objectXMin.toFixed(2)} objectYMin ${objectYMin.toFixed(2)}`, objectXMin, objectYMin)
                            // ctx.fillText(`objectXMin ${objectXMin.toFixed(2)} objectYMax ${objectYMax.toFixed(2)}`, objectXMin, objectYMax)
                            // ctx.fillText(`objectXMax ${objectXMax.toFixed(2)} objectYMin ${objectYMin.toFixed(2)}`, objectXMax, objectYMin)
                            // ctx.fillText(`objectXMax ${objectXMax.toFixed(2)} objectYMax ${objectYMax.toFixed(2)}`, objectXMax, objectYMax)
                            console.log("done drawing")

                         }

                         else if (this.$data.selected_good_labels.includes( cls['label'])) {
                           console.log("good object found in ROI, drawing")
                           // let minX = Math.min(this.$data.recEnd['x'], this.$data.recStart['x'])
                           // let minY = Math.min(this.$data.recEnd['y'], this.$data.recStart['y'])
                           let recWidth = Math.abs(objectXMin - objectXMax)
                           let recHeight = Math.abs(objectYMin - objectYMax)
                           console.log("recWidth recHeight")
                           console.log(`${recWidth}, ${recHeight}`)
                           console.log("objectXMin objectYMin")
                           console.log(`${objectXMin} ${objectYMin}`)
                           ctx.strokeStyle = "green";
                           ctx.beginPath();
                           ctx.rect(objectXMin, objectYMin, recWidth, recHeight)
                           ctx.stroke();
                           ctx.font = "16px Arial";
                           ctx.fillStyle = "#DC4929";
                           ctx.fillText(cls['label'], objectXMin, objectYMin)
                           // draw location
                           // ctx.fillText(`objectXMin ${objectXMin.toFixed(2)} objectYMin ${objectYMin.toFixed(2)}`, objectXMin, objectYMin)
                           // ctx.fillText(`objectXMin ${objectXMin.toFixed(2)} objectYMax ${objectYMax.toFixed(2)}`, objectXMin, objectYMax)
                           // ctx.fillText(`objectXMax ${objectXMax.toFixed(2)} objectYMin ${objectYMin.toFixed(2)}`, objectXMax, objectYMin)
                           // ctx.fillText(`objectXMin ${objectXMin.toFixed(2)} objectYMax ${objectYMax.toFixed(2)}`, objectXMin, objectYMax)
                           console.log("done drawing")
                         }
                        else {
                          console.log("object NOT found in ROI, drawing")
                          // let minX = Math.min(this.$data.recEnd['x'], this.$data.recStart['x'])
                          // let minY = Math.min(this.$data.recEnd['y'], this.$data.recStart['y'])
                          let recWidth = Math.abs(objectXMin - objectXMax)
                          let recHeight = Math.abs(objectYMin - objectYMax)
                          console.log("recWidth recHeight")
                          console.log(`${recWidth}, ${recHeight}`)
                          console.log("objectXMin objectYMin")
                          console.log(`${objectXMin} ${objectYMin}`)
                          ctx.strokeStyle = "yellow";
                          ctx.beginPath();
                          ctx.rect(objectXMin, objectYMin, recWidth, recHeight)
                          ctx.stroke();
                          ctx.font = "16px Arial";
                          ctx.fillStyle = "#DC4929";
                          ctx.fillText(cls['label'], objectXMin, objectYMin)
                          // draw location
                          // ctx.fillText(`objectXMin ${objectXMin.toFixed(2)} objectYMin ${objectYMin.toFixed(2)}`, objectXMin, objectYMin)
                          // ctx.fillText(`objectXMin ${objectXMin.toFixed(2)} objectYMax ${objectYMax.toFixed(2)}`, objectXMin, objectYMax)
                          // ctx.fillText(`objectXMax ${objectXMax.toFixed(2)} objectYMin ${objectYMin.toFixed(2)}`, objectXMax, objectYMin)
                          // ctx.fillText(`objectXMin ${objectXMin.toFixed(2)} objectYMax ${objectYMax.toFixed(2)}`, objectXMin, objectYMax)
                          console.log("done drawing")
                        }
                      })
                  }
                  // */

                  // "classified":[{"confidence":0.9998242259025574,"ymax":153,"label":"helmet","xmax":236,"xmin":136,"ymin":8},{"confidence":0.7896438241004944,"ymax":492,"label":"safety_vest","xmax":314,"xmin":114,"ymin":143}]


                  // this.$data.inferences.unshift(inference)
                  // localStorage.setItem('inference', JSON.stringify(inference))
                  this.getCount()
                  // this.genChartData()
                  // object detection
                  // {"webAPIId":"61539587-2c52-47d6-bfb7-a60d6d49bace","imageUrl":"http://vision-v120-prod-service:9080/vision-v120-prod-api/uploads/temp/61539587-2c52-47d6-bfb7-a60d6d49bace/ebd425bc-c675-4161-95e1-ca81bf685957.png","imageMd5":"8cb49157f32d2790dfc46b96abadbce7","classified":[{"confidence":0.9998242259025574,"ymax":153,"label":"helmet","xmax":236,"xmin":136,"ymin":8},{"confidence":0.7896438241004944,"ymax":492,"label":"safety_vest","xmax":314,"xmin":114,"ymin":143}],"result":"success"}
                  // "classified":[{"confidence":0.9998242259025574,"ymax":153,"label":"helmet","xmax":236,"xmin":136,"ymin":8},{"confidence":0.7896438241004944,"ymax":492,"label":"safety_vest","xmax":314,"xmin":114,"ymin":143}]

                  // classifier
                  // {"webAPIId":"f1bdbfb5-7a55-402d-9cd4-3d7c16d1d8d4","imageUrl":"http://vision-v120-prod-service:9080/vision-v120-prod-api/uploads/temp/f1bdbfb5-7a55-402d-9cd4-3d7c16d1d8d4/d90d3ed3-8076-4cca-b2b9-b10ba331e9f3.png","imageMd5":"f9c7439db22cf5cea47d24453876cd14","classified":{"Pneumonia-Virus":"79.53754425048828"},"result":"success"}
                  // "classified":{"Pneumonia-Virus":"79.53754425048828"}
                }
              }).catch((err) => {
                console.log("error parsing json")
                console.log(err)
              })
            }).catch((err) => {
              console.log(err)
            })
          }
          // if (f_idx == (this.$data.files.length - 1)) {
          //   this.$data.files = []
          //   this.$data.filenames = []
          // }
        // })
      },

      login() {
        localStorage.setItem('mviUrl', this.$data.mviUrl)
        if (this.$data.edge) {
          this.$data.token = null
          this.hideModal({'name': 'login-modal'})
          return
        } else {
          console.log(`requesting token from ${this.$data.mviUrl}/api/tokens`)
          var options = {
            method: "POST",
            headers: {
              'Content-Type': 'application/json'
            },
            insecure: true,
            body: JSON.stringify({
              "username": this.$data.username,
              "password": this.$data.password,
              "grant_type": "password"
            })
          }
          console.log(`login options ${JSON.stringify(options)}`)
          fetch(this.$data.url + "/api/tokens", options).then((res) => {
            console.log("token api request made")
            this.$modal.hide("login-modal")
            res.json().then((token) => {
              console.log(token)
              console.log(`received new token ${JSON.stringify(token['token'])}`)
              this.$data.token = token['token']
              localStorage.setItem('token', token['token'])
              this.getModels()
              // pull data
            }).catch((err) => {
              console.log("err in token api promise")
              console.log(err)
            })
          })
        }
      },
      inputFile: function(newFile, oldFile) {
        if (newFile && oldFile && !newFile.active && oldFile.active) {
          // Get response data
          console.log('response', newFile.response)
          if (newFile.xhr) {
            //  Get the response status code
            console.log('status', newFile.xhr.status)
          }
        }
      },
      inputFilter: function(newFile, oldFile, prevent) {
        if (newFile && !oldFile) {
          // Filter non-image file
          if (!/\.(jpeg|jpe|jpg|gif|png|webp)$/i.test(newFile.name)) {
            return prevent()
          }
        }

        // Create a blob field
        newFile.blob = ''
        let URL = window.URL || window.webkitURL
        if (URL && URL.createObjectURL) {
          newFile.blob = URL.createObjectURL(newFile.file)
        }
      },
      formatLine(inferenceId) {
        if (this.$data.inferenceDetails) {
        console.log("generating line graph for " + inferenceId)
        console.log(this.$data.inferenceDetails[inferenceId])
        var detections = this.$data.inferenceDetails[inferenceId]
        var objects = Object.keys(detections)
        var d = []
        objects.map((o) => {
          var x = Array.from(Array(detections[o].length + 1).keys())
          // d['data'].push({
          d.push({
            x: [0].concat(x),
            y: [0].concat(detections[o]),
            mode: 'lines',
            type: 'scatter',
            name: o
            // mode:"lines+markers"
          })
          console.log(d)
        })

        this.$data.lineGraphData = d
        console.log("this.$data.lineGraphData")
        console.log(this.$data.lineGraphData)
        // detections.map( (detection) )
        }
        // this.$data.lineGraph =
        // this.$data.circleGraph =
      },
      formatCircle() {
        // console.log(this.$data.inferenceDetails)
        if (this.$data.inference_rows_filtered.length > 0) {
          var rows = this.$data.inference_rows_filtered
        } else {
          var rows = this.$data.inference_rows
        }

        console.log("generating line graph")
        // var detections = this.$data.inferenceDetails[inferenceId]
        // var objects = Object.keys(detections)
        var d = {
          values: [],
          labels: [],
          type: "pie",
          textinfo: "label+value",
          textposition: "outside",
          // automargin: true,
          showlegend: true
        }

        var count = {}
        rows.map( (r, idx) => {

          if (Object.keys(count).includes(r['Class'])) {
            count[r['Class']] += 1
          } else {
            count[r['Class']] = 1
          }

          if (idx == (rows.length - 1) ) {
            console.log("finished looping rows, format pie data")
            d['labels'] = Object.keys(count)
            Object.keys(count).map((l, l_idx) => {
              d['values'].push( count[l] )
              console.log("d")
              console.log(d)
              if (l_idx  == (Object.keys(count).length - 1 ) ) {
                this.$data.circleGraphData = [d]
                console.log("this.$data.circleGraphData")
                console.log(this.$data.circleGraphData)
              }
            })
            // d['values'] =
            // d['values']
            // d['labels'].push(r['Class'])

          }
        })

        // objects.map((o) => {
        //   d['values'].push(detections[o].reduce((a, b) => a + b, 0))
        //   d['labels'].push(o)
        //   console.log(d)
        // })

      },
      getModels() {
        if (this.$data.edge) {
          var proxyUrl = `${this.$data.proxyServerIp}:${this.$data.proxyServerPort}/proxyget` + "/model-info"
        } else {
          var proxyUrl = `${this.$data.proxyServerIp}:${this.$data.proxyServerPort}/proxyget` + "/api/trained-models"
        }
        var mviUrl = this.$data.mviUrl
        var options = {
          method: "GET",
          headers: {
            "X-Auth-Token": this.$data.token || "",
            "X-Proxy-URL": mviUrl //url //this.$data.url
          }
        }
        console.log(`getting models from ${mviUrl}`)
        console.log(`options ${JSON.stringify(options)}`)
        // proxy needed for cors
        fetch(proxyUrl, options).then((res) => {
          res.json().then((models) => {
            console.log(`models received ${JSON.stringify(models)}`)
            if (this.$data.edge) {
              this.$data.models = [models]
              this.$data.allmodels = [models]
              this.refreshLabels()
            } else {
              this.$data.models = models.filter( (m) => m.deployed == '1'  )
              this.$data.allmodels = models
              this.refreshLabels()
            }
          })
        })
      },
      refreshLabels() {
        if (this.$data.selectedModelName) {
          this.setModel(this.$data.selectedModelName)
        }
      },

      showInvokeModal(config) {
        console.log("opening modal")
        // console.log(fields)
        this.$data.input = []
        console.log(config.function)
        console.log(config.fields)
        this.$data.func = config.function
        this.$data.fields = config.fields
        this.$data.title = config.title
        this.$data.user_fields = []
        this.$data.user_type = ''
        this.$modal.show('invoke-modal', {
          "fields": config.fields
        });
      },
      showModal(config) {
        console.log("opening modal")
        console.log("config")
        console.log(Object.keys(config))
        this.$data.fields = config.fields
        this.$data.title = config.title
        if (Object.keys(config).includes('src')) {
          this.$data.src = config.src
          console.log("drawing image")
          this.$modal.show(config.name, {
            "fields": config.fields
          });
          return
        }
        else if (Object.keys(config).includes('inference')) {
          console.log("inference objdetected, drawing")
          this.$data.inference = config.inference
          this.$modal.show(config.name, {
            "fields": config.fields
          });
          return
        } else {
          this.$modal.show(config.name, {
            "fields": config.fields
          });
        }
      },
      hideModal(config) {
        this.$modal.hide(config.name);
        console.log("hiding modal: " + config.name)
        // this.$data.user_fields = []
        // this.$data.user_type = ''
      },
      getFormValues() {
        console.log("getting form vals")
        console.log(this.$data.input)
        // this.output = this.$refs.my_input.value
        // console.log(this.$refs.my_input.value)
      },
      goHome() {
        this.$data.selectedInference = null
        this.$data.renderInferences = this.$data.inferences
      },
    },
    filters: {
      pretty: function(value) {
        return JSON.stringify(value, null, 2);
      }
    }


  }
</script>

<!-- TODO, finish modal -->
<!-- <script type="text/x-template" id="modal-template">
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">

          <div class="modal-header">
            <slot name="header">
              default header
            </slot>
          </div>

          <div class="modal-body">
            <slot name="body">
              default body
            </slot>
          </div>

          <div class="modal-footer">
            <slot name="footer">
              default footer
              <button class="modal-default-button" @click="$emit('close')">
                OK
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</script> -->


<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }

  #drop_zone {
    /* border: 2px dashed #eaecee; */
    /* width: 400px; */
    /* height: 300px; */
    margin: auto;
  }

  li {
    /* background: #cce5ff; */
    /* margin: 5px; */
    margin: 0;
    padding: 0;
    list-style-type: none;
  }

  select {
    margin: 50px;
    padding: 5px 35px 5px 5px;
    font-size: 16px;
    border: 1px solid #666666;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
  }

</style>

<!-- <style lang="scss">
@import "./styles/carbon";
</style> -->

<!-- <style lang="scss" scoped>
  .md-card {
    width: 320px;
    margin: 40px;
    display: inline-block;
    vertical-align: top;
  }
</style> -->

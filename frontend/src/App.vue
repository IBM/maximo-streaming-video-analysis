/* eslint-disable */
<template>


  <div id="app">
    <div id="menu" style="margin-top:40px; margin-bottom:40px">
      <div >
        <!-- <vue-button type="default" v-on:click="showModal({'name': 'upload-modal', 'title': 'Upload CSV File'})">Import CSV file</vue-button>
        <vue-button type="default" v-on:click="showModal({'name': 'filter-modal', 'title': 'Filter Table Data'})">Add/View Data Filters</vue-button>
        <vue-button type="default" v-on:click="downloadReports">Export PDF</vue-button> -->

        <CvButton style="margin: 0px 10px; text-align: center" type="default" v-on:click="showModal({'name': 'login-modal', 'title': 'Login'})">Login</CvButton>
        <CvButton style="margin: 0px 10px; text-align: center" type="default" v-on:click="showModal({'name': 'configure-model-modal', 'title': 'Configure Model'})">Configure Model</CvButton>
        <!-- <CvButton style="margin: 0px 10px; text-align: center" type="default" v-on:click="showModal({'name': 'view-configured-models'})">View Configured Models</CvButton> -->
        <CvButton style="margin: 0px 10px; text-align: center" type="default" v-on:click="showModal({'name': 'configure-stream-modal', 'title': 'Stream RTSP'})">Configure Stream</CvButton>
        <CvButton style="margin: 0px 10px; text-align: center" type="default" v-on:click="showModal({'name': 'upload-modal'})">Upload Video</CvButton>
        <!-- <CvButton style="margin: 0px 10px; text-align: center" type="default" v-on:click="showModal({'name': 'show-inference'})">Show Inference</CvButton> -->


      </div>
    </div>

    <!-- document.getElementById('testimg').src = document.getElementById('stream_canvas').getContext("webgl", {preserveDrawingBuffer: true}).canvas.toDataURL("image/png")  -->
    <!--
         var context = document.getElementById('stream_canvas').getContext("2d").drawImage(this.video, 0, 0, 960, 480)

         var context = document.getElementById('stream_canvas').getContext("webgl").drawImage(this.video, 0, 0, 960, 480)

         var context = document.getElementById('stream_canvas').getContext("webgl").drawImage(this.video, 0, 0, 960, 480).canvas

         var context = document.getElementById('stream_canvas').getContext("webgl").drawImage(this.video, 0, 0, 960, 480).canvas
         var canvas_url = canvas.toDataURL("image/png")
         document.getElementById('testimg').src = canvas_url

         document.getElementById('video')

        -->


    <div class="bx--grid">


    <div class="bx--row">


      <div  class="bx--col-lg" style="margin-right:5%">
        <!-- <div><video style="border:dotted" src="ws://localhost:9999" width="640" height="480" autoplay></video></div> -->
        <!-- <template v-if="isStreaming"> -->
          <cv-inline-loading
            style="margin-left: 18%;"
            :state="loadingState" :loading-text="loadingText">
          </cv-inline-loading>

          <div style="float:center">

            <video muted loop controls @ended="restartStream()" style="width: 640px;height:480px;z-index: 5;position: absolute ; left: 2%; top:13%" crossorigin="anonymous" ref="video" id="video" width="640" height="480" autoplay></video>
            <video muted loop controls @ended="restartStream()" style="width: 640px;height:480px;z-index: 0;position: absolute ; left: 2%; top:20%;visibility: hidden" crossorigin="anonymous" ref="remote_video" id="remote_video" width="640" height="480" autoplay></video>
            <canvas style="width: 640px;height:480px;z-index: 2000;position: absolute ; left: 3%; top:13%;" crossorigin="anonymous" ref="stream_canvas" id="stream_canvas" width="640" height="480" ></canvas>
            <canvas style="z-index: 2000;position: absolute ; left: 3%; top:13%;visibility: hidden" crossorigin="anonymous" ref="canvas" id="canvas" width="640" height="480" ></canvas>

          </div>
        <!-- </template> -->
      </div>

      <div class="bx--col" style="margin-right:5%">

        <h3>Inference Results</h3>
        <template v-if="Object.keys(selectedModel).length > 0">
          <!-- <h5>Selected Model</h5> -->
          <h5>{{selectedModel['name']}}</h5>
        </template>

        <template v-if="inferences.length > 0">
        </template>
        <div>
          <div style="border:1px solid rgb(128, 201, 123); float:left;width:50%;height:500px;">
            <h5>Good Labels</h5>
            <p>
              found in {{Object.keys(inferencesByCategory['positive']).length}} images
            </p>
            <div style="height:70px;overflow-y:auto;">
              <template v-for="label in selected_good_labels">
                <cv-tag
                :label="label"
                :kind="gray"
                ></cv-tag>
              </template>
            </div>

            <div style="display: grid; overflow-y:auto; grid-template-columns: auto auto;height:400px">
              <template v-for="inference in inferences">
                <!-- <template v-if="inference.classified.filter(value => selected_good_labels.map(l => l.toLowerCase()).includes(value.label)).length > 0" > -->

                <!-- {"_negative_":"0.78148"} -->

                <template v-if="checkClasses(inference, selected_good_labels, 'positive').length > 0">
                  <cv-tile style="width:150px;height:100px" v-on:click.native="showModal({'name': 'show-inference', 'inference': inference})" :kind="inferenceTileKind">
                    <img style="width:120px;height:80px" :src=inference.canvas_url><img/>
                    <!-- Detected Objects: {{inference.classified.map( i => `${i.confidence} ${i.label}`).join('_')}} -->
                  </cv-tile>
                </template>
              </template>
            </div>
          </div>


          <div style="border:1px solid rgb(237, 43, 33); float:right;width:50%;height:500px;">
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
              <div style="display: grid; overflow-y:auto; grid-template-columns: auto auto;height:400px">
                <template v-for="inference in inferences">
                  <!-- <template v-if="inference.classified.filter(value => selected_bad_labels.map(l => l.toLowerCase()).includes(value.label)).length > 0" > -->
                  <template v-if="checkClasses(inference, selected_bad_labels, 'negative').length > 0">
                    <!-- <cv-tile style="height:200px; width:250px" kind="clickable" theme=""> -->
                    <cv-tile  style="width:150px;height:100px" v-on:click.native="showModal({'name': 'show-inference', 'inference': inference})"  :kind="inferenceTileKind">
                      <img style="width:120px;height:80px" :src=inference.canvas_url><img/>
                      <!-- Detected Objects: {{inference.classified.map( i => `${i.confidence} ${i.label}`).join('_')}} -->
                    </cv-tile>
                  </template>
                </template>
              </div>
          </div>
        </div>
      </div>

      <div class="bx--col-4">
        <ccv-donut-chart style="margin-top:40%" :data='chartData' :options='chartOptions'></ccv-donut-chart>
      </div>
    </div>




  </div>

  <div class="bx--row">
    <div style="float:left;margin-left:5%">
      <!-- <cv-button style="margin-right:10px;" id="snap" v-on:click="capture()">Analyze Frame</cv-button>           -->
      <cv-button id="interval" style="margin-right: 10px" v-on:click="intervalCapture()">Start Image Analysis</cv-button>
      <cv-button style="margin: 0px 10px; text-align: center" type="default" v-on:click="stopStream">Stop Analysis</cv-button>
      <cv-button id="configure_interval" style="margin-left: 10px" v-on:click="showModal({'name': 'configure-interval-modal'})">Set Interval</cv-button>
      <!-- <Settings32  style="float:right" @click="showModal({'name': 'configure-interval-modal'})"/> -->
      <!-- <CalendarSettings16/> -->
    </div>
    <div class="bx--col"></div>

  </div>

  <div class="bx--row" style="align-items: center; justify-content: center;margin-top:50px;height:600px;overflow-y:auto;">

    <div class="bx--col-lg-32">
    <cv-data-table :zebra=true :columns="['Type', 'Date', 'Classes', 'Model']">
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
  </div>
    <!-- <div class="bx--grid" style="width:90%;margin-top:40%">
      <div class="bx--row">
        <div class="bx--col">
          <cv-tile>
            Counts
            <cv-data-table :columns="['Class', 'Count']" :data="Object.keys(counts).map((key) => [key, counts[key]])" ref="table"></cv-data-table>
          </cv-tile>

        </div>
        <div class="bx--col">
          <cv-tile>
            <ccv-donut-chart :data='chartData' :options='chartOptions'></ccv-donut-chart>
            {{chartData}}
            <hr />
          </cv-tile>
        </div>
      </div>
    </div> -->

    <!-- TODO finish testing grid -->

      <!-- {{inferencesByCategory['negative']}} -->


        <!-- <cv-data-table :columns="['']" :data="inferences"   ref="table"></cv-data-table> -->
      <!-- {{ inferencesByCategory['positive'][ Object.keys(inferencesByCategory['positive'])[0] ] }} -->

      <!-- <hr style="width:95%" />
      Images with Positive Inferences
      {{Object.keys(inferencesByCategory['positive']).length}}
      <hr style="width:95%" />
      Images with Negative Inferences
      {{Object.keys(inferencesByCategory['negative']).length}}
      <hr style="width:95%" />
      {{inferencesByCategory['positive']}}
      <hr style="width:95%" /> -->


    <!-- </template> -->

    <!-- TODO, style feed -->
    <!-- <div style="width:45%">
      {{inferences[0]}}
      <template v-for="inference in inferences">

        <div>
          <div style="float:left">
            <img style="width:120px;height:80px" :src=inference.canvas_url><img/>
          </div>
          <div style="float:right">
            <h5>{{parseDate(inference.created_date)}}</h5>
            <p>Classes {{inference.classified.map( cls => `${cls.label} ${cls.confidence}` ).join(',')}}</p>
          </div>
        </div>
      </template>
    </div> -->



    <!-- <div v-if="inference_rows && (inference_rows.length > 0)">
      Rendered Table Component
      <template >
        <inf-table inference_headers="inference_headers" inference_rows="inference_rows">
        </inf-table>
      </template>
      End Rendered Table Component
    </div> -->
    <div>



      <modal name="upload-modal" height="auto" style="z-index: 3000;">
          <h2 align="center"> Upload File </h2>
          <cv-file-uploader
            :accept="['.mp4']"
            :multiple=false
            ref="fileUploader">
          </cv-file-uploader>
          <cv-button @click="uploadFile() ; hideModal({name: 'upload-modal'})">Submit</cv-button>
      </modal>

      <modal name="show-inference" height="auto" style="z-index: 4000;">
        <!-- <cv-tile kind="clickable" style="float:center"> -->
          <h2 align="center"> Inference </h2>
          <h5 align="center"> {{parseDate(inference.created_date)}} </h5>

          <!-- <img :src="url + inference['thumbnail_path']"/> -->
          <canvas id="image_canvas" v-overlay-image="inference"></canvas>
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
        <cv-form style="margin-left:20px;margin-right:20px" @submit.prevent="stream">
          <cv-number-input
            style="margin-left:25%;margin-top:25px"
            label="Analysis Interval (Seconds)"
            v-model="interval"
            min=".1"
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
              v-model="url">
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
            <cv-button style="margin-bottom:10px;margin-top:10px;float:right">Submit</cv-button>
          </cv-form>
      </modal>
    </div>

    <!-- TODO draw rect -->
    <!-- <vue-button type="default" v-on:click="showModal({'name': 'view-image'})">Image</vue-button> -->
    <div style="margin: 0; position: absolute; top: 50%; left: 50%;z-index: 3000;" >
      <modal name="view-image" height="auto" >
        <h2 align="center"> Image </h2>
        <div>
          <canvas id="image_canvas" v-overlay-image="inference"></canvas>
          <!-- <img :src=src><img/> -->
        </div>
        <div>
          <vue-button type="default" v-on:click="hideModal({'name': 'view-image'})">Cancel</vue-button>
        </div>
      </modal>
    </div>

    <modal name="configure-model-modal" height="430px" style="z-index: 3000;" >
      <h2 align="center" style="margin-top:20px"> Configure Model </h2>
      <cv-form style="margin-left:20px;margin-right:20px" @submit.prevent="updateModelConfig">
          <!-- <cv-text-input
            label="Example text label"
            helper-text="Optional helper text here; if message is more than one line text should wrap (~100 character count maximum)"
            placeholder="Optional placeholder text">
          </cv-text-input>
          <cv-text-area
            label="Example text label"
            helper-text="Optional helper text here; if message is more than one line text should wrap (~100 character count maximum)"
            placeholder="Optional placeholder text">
          </cv-text-area> -->
          <!-- <cv-select v-mode.lazy="selectedModel" label="Models"> -->
          <div>
            <cv-select @change="setModel" v-model="selectedModelName" id="modelSelector" ref="modelSelector" theme="" label="Select Model" :hide-label=false >
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
                selection-feedbak="top-after-reopen"
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
          <cv-button  style="margin-top:20px;margin-bottom:20px;float:right" >Select</cv-button>
        </cv-form>

    </modal>

    <!-- <div v-if="!isHidden" style="z-index:9000">
      <vue-form
        id="chaincode-form"
        :model="form"
        style="width: 75%; position: fixed; left: 50%; margin-left: -37.5%;">
        <h2 style="float:center"> Invoke Chaincode </h2>
        <vue-form-item label="Function">
          <vue-input
            placeholder="Function"
            v-model="form.function"
            style="width: 100%">
          </vue-input>
        </vue-form-item>

        <vue-form-item label="Arguments">
          <vue-input
            placeholder="Arguments"
            v-model="form.args"
            style="width: 100%">
          </vue-input>
        </vue-form-item>
        <vue-form-item>
          <vue-button type="default" v-on:click="isHidden = true">Cancel</vue-button>
          <vue-button type="success" v-on:click="invoke" >Submit</vue-button>
        </vue-form-item>
      </vue-form>
    </div> -->
    <!-- <vue-form-item> item 1 </vue-form-item>
      <vue-form-item> item 2 </vue-form-item> -->
    <!-- <vue-input placeholder="Please input"></vue-input>
      <vue-input placeholder="Please input"></vue-input> -->


    <!-- </v-app> -->
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
  // import DemoLoginModal       from './components/modals/DemoLoginModal.vue'

  // import 'vue-js-modal'
  // import { Card } from 'v-card'
  // import { DataTable } from 'v-data-table'
  // import { Button } from 'vfc'



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
          var can_w = ctx.canvas.width
          var can_h = ctx.canvas.height
          var colors = ['red', 'blue', 'green', 'yellow', 'purple']
          var heatmap = new Image
          heatmap.id = "heatmap"
          console.log('_id')
          var i = new Image
          i.id = "image"
          i.onload = function() {
              console.log("creating thumbnail canvas image")
              var img_w = this.width
              var img_h = this.height
              var can_w = ctx.canvas.width //= 400
              var can_h = ctx.canvas.height //= 500
              // var hRatio = canvasElement.width / img_w    ;
              // var vRatio = canvasElement.height / img_h  ;
              console.log(`img_h ${img_h} img_w ${img_w} can_w ${can_w} can_h ${can_h}`)
              var vRatio = 1
              var hRatio = 1

              ctx.canvas.width = img_w
              ctx.canvas.height = img_h
              console.log(`img_h ${img_h} img_w ${img_w} can_w ${ctx.canvas.width} can_h ${ctx.canvas.height}`)
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
                  // context.rect(x,y,width,height)
                  // ctx.rect(20, 20, 150, 100);
                  // var ratio = 0.5 // 0.7220216606498195
                  // var y_offset = -150

                  var tl_x = o['xmin'] * hRatio
                  var tl_y = (o['ymin'] * vRatio)

                  var w = (o['xmax'] - o['xmin']) * hRatio
                  var h = (o['ymax'] - o['ymin']) * vRatio
                  ctx.lineWidth = "6";
                  ctx.strokeStyle = colors[idx % colors.length];
                  ctx.fillStyle = colors[idx % colors.length];
                  // ctx.strokeStyle = "blue";
                  console.log(`xmin ${o['xmin']}, ymax ${o['ymax']}, hRatio ${hRatio} vRatio ${vRatio}`)
                  console.log(`w ${w}, h ${h}, tl_x ${tl_x}, tl_y ${tl_y} ` )
                  ctx.beginPath()
                  ctx.font = "30px Arial";
                  ctx.fillText(o['label'], o['xmin'] + 20, o['ymin'] + 20)
                  ctx.rect( tl_x, tl_y, w, h )
                  // ctx.rect( tl_x + centerShift_x, tl_y + centerShift_y, w, h )
                  // ctx.rect( tl_x + centerShift_x, tl_y + centerShift_y + y_offset, w, h )
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
                // if (inference['value']['ImageURL']) {
                //   var s = inference['value']['ImageURL'].split('.')
                //   var image_type = s[s.length - 1]
                // }
                // heatmap.src = 'data:image/' + image_type + ';base64,' + inference['value']['Heatmap/Boxes']
                heatmap.src = inference['value']['heatmap']
              }
          }
          // if (Object.keys(inference['value']).includes('ImageURL')) {
          //   i.src = inference['value']['ImageURL']
          // } else {
            console.log("writing thumbnail")
            // console.log('data:image/' + 'png' + ';base64,' + inference['value']['Thumbnail'])
            // i.src = 'data:image/' + 'png' + ';base64,' + inference['value']['Thumbnail']
            // i.src = url + inference['value']['thumbnail_path']
            i.src = inference['value']['url'] + inference['value']['thumbnail_path']
          // }

          // console.log(`drawing image at ${inference['value']['ImageURL']}` )
          console.log(`canvasElement.width ${canvasElement.width}` )
          console.log(`canvasElement.height ${canvasElement.height}` )
      }
    },

    data() {
      return {
        loadingText: "",
        loadingState: "none",
        form: {
          function: '',
          args: ''
        },
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
        chartData: [
        		{ "group": "", "value": 1},
            // { "group": "Warning", "value": 12000},
            // { "group": "Success", "value": 12000}
        ],
        chartOptions: {
      		"title": "",
      		"resizable": true,
      		"donut": {
      				"center": {
      						"label": "Objects/Classes Detected"
      				}
      		},
      		"height": "400px"
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
        url: (localStorage['paiv_url'] || process.env.VUE_APP_URL),
        username: (localStorage['paiv_user'] || process.env.VUE_APP_USER),
        password: (localStorage['paiv_password'] || process.env.VUE_APP_PASSWORD),
        css: {
          table: {
            tableWrapper: '',
            tableHeaderClass: 'fixed',
            tableBodyClass: 'vuetable-semantic-no-top fixed',
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
      this.$data.url = localStorage.getItem('url')
      let recaptchaScript = document.createElement('script')
      recaptchaScript.setAttribute('src', 'http://localhost:3000/scripts/jsmpeg.min.js')
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
      if (this.$data.token) {
        console.log("previous token loaded")
        // TODO, add regex to check token. also add last time token was refreshed
        this.getModels()
      }
      // this.getInferenceDetails();
    },
    methods: {


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
      uploadFile() {
        this.$data.streamingType = "file"
        this.$data.isStreaming = true
        this.$refs.video.style.visibility = "hidden"
        this.$refs.remote_video.style.visibility = "visible"
        this.$data.videoPlaying = true

        let file = this.$refs.fileUploader.internalFiles[0].file
        console.log(this.$refs.fileUploader.internalFiles)
        console.log(file)
        let localUrl = window.URL.createObjectURL(file)
        this.$data.localFileSrc = localUrl
        this.$refs.remote_video.src = localUrl
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

        var url = 'http://localhost:3000/stream'
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
            this.$refs.video.style.visibility = "hidden"
            this.$refs.remote_video.style.visibility = "visible"

            res.json().then( (res) => {
              console.log(res)
              console.log(`setting vid stream ${res.url}`)
              // this.$refs.remote_video.src = res.url
              this.$refs.remote_video.src = "http://localhost:3000/ytstream"
            })
          } else {
            console.log("stream started")
            this.$data.isStreaming = true
            this.$refs.stream_canvas.style.height = "480px"
            this.$refs.stream_canvas.style.visibility = 'visible'
            this.$refs.canvas.style.visibility = 'hidden'
            this.$refs.video.style.visibility = 'hidden'
            this.$refs.video.style.height = "0px"
            this.$data.streamingType = "rtsp"
              // this.$data.player = new JSMpeg.Player('ws://localhost:9999', {
            this.player = new JSMpeg.Player('ws://localhost:9999', {
              canvas: document.getElementById('stream_canvas'),
              disableGl: true
            })
          }

        }).catch( err => console.log(`starting stream error ${err} `))
      },
      stopStream(){

        var url = 'http://localhost:3000/stream'
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
        this.$refs.stream_canvas.style.height = '0px'

        this.$refs.remote_video.style.visibility = 'hidden'

        // this.$refs.canvas.style.visibility = 'visible'
        this.$refs.video.style.visibility = 'visible'
        this.$refs.video.style.height = "480px"

        fetch(url, options).then((res) => {
          console.log("stopping stream")
          this.$data.isStreaming = false
          // this.$data.player = new JSMpeg.Player('ws://localhost:9999', {
          //   canvas: document.getElementById('stream_canvas'), // Canvas should be a canvas DOM element
          //   disableGl: true
          //
          // })
          console.log(this.player)
          this.player.stop()
        }).catch( err => console.log(`getting models error ${err} `))
      },
      getCount() {
        // inferences = [ {classified: [{"label": "foo"}] }, {classified: [{"label": "bar"}, {"label": "foo"}] }, {classified: [{"label": "dfs"}, {"label": "dfs"}] } ]
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
      },
      getStats() {

        // Object.keys(inferencesByCategory['positive'])

        // uniqLabels.map
        // .filter(  )
      },
      loadModelConfig(modelName) {
        // let model = this.$data.selectedModel
        // if ( (model.name) && ( Object.keys(this.$data.modelConfigs).includes(model.name) ) ) {
        // modelName = model.name
        console.log("loading model config")
        console.log(this.$data.modelConfigs)
        if (this.$data.modelConfigs.includes(modelName)) {
          this.$data.selected_good_labels = this.$data.modelConfigs[modelName]['good']
          this.$data.selected_good_labels = this.$data.modelConfigs[modelName]['bad']
        }
      },
      updateModelConfig() {
        //if ( Object.keys(this.$data.selectedModel).length > 0 ) {
        console.log("in updateModelConfig")
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
        // var e = document.getElementById("modelSelector");
        // var modelName = document.getElementById("selectedModel").options[e.selectedIndex].value
        console.log(this.$refs.modelSelector)
        var modelName = this.$data.selectedModelName
        console.log(modelName)
        // console.log(Object.keys(modelName))
        // console.log(`setting modelName: ${JSON.stringify(modelName)}`)
        // this.$refs.modelSelector.value = modelName
        var filteredModels = this.$data.models.filter(m => m.name == modelName)
        // console.log( `filteredModels ${JSON.stringify(filteredModels)}` )
        console.log( `${filteredModels.length} matching models found}` )
        // this.loadModelConfig(modelName)
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
          this.$data.good_labels = multiSelectOpts
          this.$data.bad_labels = multiSelectOpts
          console.log(`multiSelectOpts ${JSON.stringify(multiSelectOpts)}`)
          this.$data.selectedModel = filteredModels[0]
          this.loadModelConfig(modelName)
          return
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
          console.log(filtered_inference)
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
      capture() {
          if ( Object.keys(this.selectedModel).length == 0) {
            console.log("no model selected")
            return
          }
          var that = this
          var date = new Date(Date.now())
          console.log(`capturing at ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`)
          console.log(this.$refs)
          if ((this.$data.isStreaming) && (this.$data.streamingType == 'rtsp')) {
            console.log("sampling rtsp feed")
            // this.$refs.stream_canvas.style.visibility = 'visible'
            // this.$refs.canvas.style.visibility = 'hidden'
            this.canvas = this.$refs.stream_canvas;
            var canvas_url = this.canvas.toDataURL('png') //document.getElementById('stream_canvas').toDataURL('png')
            console.log(canvas_url)
            // document.getElementById('testimg').src = canvas_url
            // var context = this.canvas.getContext("2d").drawImage(this.video, 0, 0, 640, 480);
            // var canvas_url = canvas.toDataURL("image/png")

            // document.getElementById('stream_canvas').toDataURL('png')
            // var context = this.canvas.getContext("webgl", {preserveDrawingBuffer: true}) //.drawImage(this.video, 0, 0, 640, 480);
            // var context = this.canvas
            // document.getElementById('stream_canvas').getContext('2d')
            // var i = document.getElementById('stream_canvas').getContext("webgl", {preserveDrawingBuffer: true}).canvas.toDataURL("image/png")

          } else if ((this.$data.isStreaming) && ((this.$data.streamingType == 'youtube') || (this.$data.streamingType == 'file')  ) ) {
            console.log("sampling youtube video")
            this.canvas = this.$refs.canvas;
            var context = this.canvas.getContext("2d").drawImage(this.$refs.remote_video, 0, 0, 640, 480);
            // this.$refs.remote_video.style.border = "dotted"
            var canvas_url = canvas.toDataURL("image/png")

          } else { // webcam
            console.log("sampling webcam video")
            this.$refs.stream_canvas.style.visibility = 'hidden'
            // this.$refs.canvas.style.visibility = 'visible'
            this.canvas = this.$refs.canvas;
            var context = this.canvas.getContext("2d").drawImage(this.video, 0, 0, 640, 480);
            var canvas_url = canvas.toDataURL("image/png")
          }
          this.captures.push(canvas_url);

          // console.log(`canvas url ${canvas_url}`)
          this.canvas.toBlob(function(blob){ that.submitInference(blob, canvas_url)}, 'image/png'); // JPEG at 95% quality

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
        var url = "http://localhost:3000/proxyget" + "/api/trained-models"
        // var url = "http://localhost:8081/proxyget" + "/api/trained-models"
        // var url = this.$data.url + "/api/trained-models"
        // fetch(this.$data.url + "/trained-models", options).then((res) => {
        // proxy needed for cors
        fetch(url, options).then((res) => {
          console.log("models received")
          // console.log(res)
          res.json().then((models) => {
            // if ( models != {} ) {
              console.log(models)
              this.$data.models = models.filter( (m) => m.deployed == '1'  )
              this.$data.allmodels = models
            // }
          }).catch( err => console.log(`parsing model json error ${err} `) )
        }).catch( err => console.log(`getting models error ${err} `) )
      },

      submitInference(image, canvas_url) {
        // post to powerai when user clicks "upload"

        // var e = document.getElementById("selectedModel");
        // var selectedModel = e.options[e.selectedIndex].value
        // this.$data.selectedModel = selectedModel

        // let model = this.$data.models.filter( m => m.name == this.$data.selectedModel['name'] )[0]
        let model = this.$data.selectedModel
        console.log(`image type ${typeof image}`)
        console.log(`submitting inference to model ${model['name']}`)
        // this.$data.files.map((file, f_idx) => {
        // if ((modelInfo) && (modelInfo.usage == "cic") && (file.name.includes('mp4'))) {

        if (false) {
          console.log("posting video to classifier")
          console.log("convert video to frames")
          var headers = {
            "X-Fragment-Video": "1",
            // "X-File-Name": file.name,
            "X-Proxy-URL": this.$data.url
          }
        } else {
          // return
          var headers = {
            "X-Proxy-URL": this.$data.url
          }
        }
          var blobAppended = true
          var formData = new FormData()
          // var img = new Blob(canvas_url)
          formData.append('blob', image, 'image.png')
          // formData.append('blob', canvas_url, 'image.png')
          // formData.append('blob', img, 'image.png')

          // var appendDone = false
          if (blobAppended) {
            var options = {
              method: "POST",
              body: formData,
              headers: headers
            }
            console.log("uploading file opts")
            console.log(`${JSON.stringify(options)}`)
            console.log("posting to: " + "http://localhost:3000/proxypost" + "/api/dlapis/" + model['_id'])
            fetch("http://localhost:3000/proxypost" + "/api/dlapis/" + model['_id'], options).then((res) => {
              console.log("inference uploaded")
              // TODO, show a "loading" gif until inference is fully uploaded?
              res.json().then((result) => {
                console.log("json")
                console.log(result)
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
                    url: this.$data.url
                  }
                  console.log("appending video classification inference ")
                  console.log(inference)
                  this.$data.inferences.push(inference)

                } else if (Object.keys(result).includes('classified')) {
                  // process single image
                  this.$data.inferenceDetails[result.imageMd5] = {}
                  var endpoint = result.imageUrl.split('/uploads')[1]
                  // var labels = Array.from(new Set(result.classified.map((c) => c.label)))

                  // if classified is "array", we're receiving results of "object detection"
                  // if (Array.isArray(result.classified)) {
                  // ['usage'] == 'cic' // classification
                  // ['usage'] == 'cod' // object detection
                  if (this.$data.selectedModel.usage == 'cod') {
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
                  var filename = endpoint.split('/').slice(-1)[0]

                  var inference = {
                    _id: result.imageMd5,
                    analysis_type: analysis_type, //"image",
                    canvas_url: canvas_url,
                    created_date: (new Date().toJSON()),
                    thumbnail_path: '/uploads' + endpoint,
                    status: result['result'],
                    filename: "capture_" + (new Date().toJSON()), //filename,
                    model_id: result['webAPIId'],
                    heatmap: heatmap,
                    percent_complete: 100,
                    classified: result['classified'],
                    url: this.$data.url
                  }
                  console.log("appending inference ")
                  console.log(inference)
                  this.$data.inferences.push(inference)
                  this.getCount()
                  this.genChartData()
                  // object detection
                  // {"webAPIId":"61539587-2c52-47d6-bfb7-a60d6d49bace","imageUrl":"http://vision-v120-prod-service:9080/vision-v120-prod-api/uploads/temp/61539587-2c52-47d6-bfb7-a60d6d49bace/ebd425bc-c675-4161-95e1-ca81bf685957.png","imageMd5":"8cb49157f32d2790dfc46b96abadbce7","classified":[{"confidence":0.9998242259025574,"ymax":153,"label":"helmet","xmax":236,"xmin":136,"ymin":8},{"confidence":0.7896438241004944,"ymax":492,"label":"safety_vest","xmax":314,"xmin":114,"ymin":143}],"result":"success"}
                  // "classified":[{"confidence":0.9998242259025574,"ymax":153,"label":"helmet","xmax":236,"xmin":136,"ymin":8},{"confidence":0.7896438241004944,"ymax":492,"label":"safety_vest","xmax":314,"xmin":114,"ymin":143}]

                  // classifier
                  // {"webAPIId":"f1bdbfb5-7a55-402d-9cd4-3d7c16d1d8d4","imageUrl":"http://vision-v120-prod-service:9080/vision-v120-prod-api/uploads/temp/f1bdbfb5-7a55-402d-9cd4-3d7c16d1d8d4/d90d3ed3-8076-4cca-b2b9-b10ba331e9f3.png","imageMd5":"f9c7439db22cf5cea47d24453876cd14","classified":{"Pneumonia-Virus":"79.53754425048828"},"result":"success"}
                  // "classified":{"Pneumonia-Virus":"79.53754425048828"}
                }


                // "http://powerai-vision-ny-service:9080/powerai-vision-ny-api/uploads/temp/ee5f1177-7ff1-4cd5-86d2-60faca266c71/16acd8ad-2008-484b-8f7a-e669621852f3.jpg"
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
        console.log("requesting token")
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
        console.log(`login options ${options}`)
        localStorage.setItem('url', this.$data.url)
        fetch(this.$data.url + "/api/tokens", options).then((res) => {
          console.log("token api request made")
          this.$modal.hide("login-modal")
          res.json().then((token) => {
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
      /*
      login() {
        console.log("requesting token")
        console.log(this.$data.input)
        if (this.$data.input.length > 0) {
          // localStorage.setItem('paiv_url', this.$data.input[0])
          // localStorage.setItem('paiv_user', this.$data.input[1])
          // localStorage.setItem('paiv_password', this.$data.input[2])
          this.$data.url = this.$data.input[0]
          this.$data.username = this.$data.input[1]
          this.$data.password = this.$data.input[2]
        }
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
      },*/
      getModels() {
        var options = {
          method: "GET",
          headers: {
            "X-Auth-Token": this.$data.token,
            "X-Proxy-URL": this.$data.url
          }
        }
        var url = 'http://localhost:3000/proxyget' + "/api/trained-models"
        console.log("getting models")
        console.log(`${url}`)
        console.log( options['headers'] )
        // fetch(this.$data.url + "/trained-models", options).then((res) => {
        // proxy needed for cors
        fetch(url, options).then((res) => {
          console.log("models received")
          // console.log(res)
          res.json().then((models) => {
            console.log(models)
            this.$data.models = models.filter( (m) => m.deployed == '1'  )
            this.$data.allmodels = models
          })
        })
      },
      getDatasets() {
        var options = {
          method: "GET",
          headers: {
            "X-Auth-Token": this.$data.token,
            "X-Proxy-URL": this.$data.url
          }
        }
        console.log("getting datasets")
        // fetch(this.$data.url + "/trained-models", options).then((res) => {
        // proxy needed for cors
        fetch('http://localhost:3000/proxyget' + "/api/datasets", options).then((res) => {
          console.log("datasets received")
          // console.log(res)
          res.json().then((datasets) => {
            console.log("parsed dataset json")
            this.$data.datasets = datasets //models.filter( (m) => m.deployed == '1'  )
          })
        }).catch( (err) =>  {
          console.log("error getting datasets")
          console.log(err)
        })
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

<!-- <script type="text/javascript" src="localhost:3000/scripts/jsmpeg.min.js"></script> -->



<!-- <style lang="scss" scoped>
  .md-card {
    width: 320px;
    margin: 40px;
    display: inline-block;
    vertical-align: top;
  }
</style> -->

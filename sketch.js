// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
PoseNet example using p5.js
=== */

let video;
let poseNet;
let poses = [];
let canvas;

let snapshots = [];

let poseScanningRunning = false;

function setup() {
  canvas = createCanvas(320, 240);
  // createCanvas(320, 240);
  canvas.parent("videoId");
  background(51);
  video = createCapture(VIDEO);
  video.size(320, 240);

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected

  // Hide the video element, and just show the canvas
  // video.hide();
}

function takeSnapshot() {
  snapshots.push(video.get());
  image(video, 0, 0);
}

// put the pose event callback in a variable
const poseCallback = function (results) {
  poses = results;
  let part = poses[0].pose.keypoints[0].part;
  let posX = poses[0].pose.keypoints[0].position.x;
  let posY = poses[0].pose.keypoints[0].position.y;
  select("#status").html(part + ";" + posX + ";" + posY);
  // console.log("poses: ", poses[0].pose.keypoints[0]);
};

function checkMoving() {
  let cnt = 0;
  let intervalId = setInterval(async function () {
    snapshots[cnt] = video.get();
    console.log("say hello", Date.now(), snapshots[cnt]);
    if (video.loadedmetadata) {
      let img = video.get();
      image(img, 200, 400, 320, 2400);
      snapshots.push(img);
    }
    if (cnt++ >= 1) {
      clearInterval(intervalId);
    }
  }, 1000);
}

function takePicture() {
  console.log("takePicture", Date.now());
}

function startScanning() {
  poseScanningRunning = true;
  poseNet.on("pose", poseCallback);
}
function stopScanning() {
  poseNet.removeListener("pose", poseCallback);
  poseScanningRunning = false;
}

function modelReady() {
  select("#status").html("Model Loaded");
}

function draw() {
  // image(video, 0, 0, width, height);
  // We can call both functions to draw all keypoints and the skeletons
  if (poseScanningRunning) {
    drawKeypoints();
    drawSkeleton();
  }
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i++) {
    let skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j++) {
      let partA = skeleton[j][0];
      let partB = skeleton[j][1];
      stroke(255, 0, 0);
      line(
        partA.position.x,
        partA.position.y,
        partB.position.x,
        partB.position.y
      );
    }
  }
}

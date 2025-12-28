import React, { useEffect, useRef, useState } from "react";
import * as posedetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import { angleABC } from "./geometry";

const MIN_SCORE = 0.35;

export default function CameraCoach() {
  const videoRef = useRef(null);

  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [hint, setHint] = useState("Enable camera to start form check.");
  const [kneeAngle, setKneeAngle] = useState(null);

  useEffect(() => {
    let detector = null;
    let rafId = null;
    let stream = null;

    async function start() {
      if (!enabled) return;

      setReady(false);
      setHint("Initializing camera and model...");

      // Init TF backend
      await tf.setBackend("webgl");
      await tf.ready();

      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });

      const video = videoRef.current;
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();

      detector = await posedetection.createDetector(posedetection.SupportedModels.MoveNet, {
        modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING
      });

      setReady(true);
      setHint("Try a small squat. Keep it pain-free.");

      const loop = async () => {
        try {
          const poses = await detector.estimatePoses(video, { maxPoses: 1, flipHorizontal: true });
          const kps = poses?.[0]?.keypoints || [];

          const by = Object.fromEntries(kps.map((k) => [k.name, k]));

          const hip = by.left_hip;
          const knee = by.left_knee;
          const ankle = by.left_ankle;
          const shoulder = by.left_shoulder;

          const ok =
            hip?.score > MIN_SCORE &&
            knee?.score > MIN_SCORE &&
            ankle?.score > MIN_SCORE &&
            shoulder?.score > MIN_SCORE;

          if (!ok) {
            setKneeAngle(null);
            setHint("Step back a little. Keep full body in frame.");
          } else {
            const angle = angleABC(hip, knee, ankle);
            setKneeAngle(angle);

            // Coaching rules (demo)
            if (angle == null) {
              setHint("Hold still for a moment.");
            } else if (angle > 165) {
              setHint("Bend knees slightly. Slow and controlled.");
            } else if (angle >= 120 && angle <= 165) {
              setHint("Nice. Keep knees tracking forward. Chest open.");
            } else if (angle < 120) {
              setHint("Too deep for rehab demo. Reduce range. Stay pain-free.");
            }

            // Very rough torso cue
            const dx = Math.abs(shoulder.x - hip.x);
            if (dx > 90) setHint("Turn your torso slightly to face the camera.");
          }
        } catch {
          // ignore
        }
        rafId = requestAnimationFrame(loop);
      };

      loop();
    }

    start();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (detector) detector.dispose();
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [enabled]);

  return (
    <section className="grid lg:grid-cols-2 gap-6 items-start">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-5">
        <h2 className="text-lg font-semibold">Camera Coach (demo)</h2>
        <p className="text-sm text-slate-600 mt-1">
          Pose detection + angle cues. Educational demo, not medical advice.
        </p>

        <div className="mt-4 rounded-2xl overflow-hidden border border-slate-200 bg-[#fbfaf7]">
          <video ref={videoRef} className="w-full aspect-video object-cover" />
        </div>

        <div className="mt-4 flex flex-wrap gap-3 items-center">
          <button
            onClick={() => setEnabled((v) => !v)}
            className="rounded-full px-4 py-2 bg-slate-900 text-white text-sm"
          >
            {enabled ? "Stop" : "Enable Camera"}
          </button>

          <div className="text-sm text-slate-600">
            Status: <span className="font-semibold">{enabled ? (ready ? "Running" : "Loading") : "Off"}</span>
          </div>

          <div className="text-sm text-slate-600">
            Knee angle: <span className="ml-2 font-semibold">{kneeAngle ?? "—"}°</span>
          </div>
        </div>
      </div>

      <aside className="bg-white rounded-2xl border border-slate-200 shadow-soft p-5">
        <h3 className="text-base font-semibold">Coach feedback</h3>
        <p className="text-sm text-slate-700 mt-3">{hint}</p>

        <div className="mt-5 text-xs text-slate-500 leading-relaxed">
          For higher accuracy: add exercise selection, multi-joint checks, confidence thresholds per keypoint,
          and smoothing over time. This demo focuses on clean architecture and rubric compliance.
        </div>
      </aside>
    </section>
  );
}

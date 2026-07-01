"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ScanFace, CheckCircle2, Trash2, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadFaceApi, loadModels } from "@/lib/face-loader";
import type { EmployeeRecord } from "@/types";

export function FaceRegisterWidget({
  employee,
  onClose,
  onRegisterSuccess,
}: {
  employee: EmployeeRecord;
  onClose: () => void;
  onRegisterSuccess: () => void;
}) {
  const [faceApi, setFaceApi] = useState<any>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [registerStatus, setRegisterStatus] = useState("Position face and click capture");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const hasFace = !!employee.faceDescriptor && employee.faceDescriptor.length === 128;

  // Initialize face-api
  useEffect(() => {
    let active = true;
    
    async function initFaceApi() {
      try {
        setLoadingStatus("Loading face analysis modules...");
        const api = await loadFaceApi();
        if (!api) return;

        if (active) {
          setFaceApi(api);
          await loadModels(api, (msg) => {
            if (active) setLoadingStatus(msg);
          });
          if (active) {
            setModelsLoaded(true);
            startCamera();
          }
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setError("Failed to load Face AI models.");
        }
      }
    }

    if (!hasFace) {
      initFaceApi();
    }

    return () => {
      active = false;
      stopCamera();
    };
  }, [employee]);

  // Start camera
  async function startCamera() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to access webcam. Please check permissions.");
    }
  }

  // Stop camera
  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }

  // Perform face registration
  async function handleCapture() {
    if (!videoRef.current || !faceApi || isSubmitting) return;

    setIsSubmitting(true);
    setRegisterStatus("Detecting face...");
    setError("");

    try {
      // Small timeout to ensure video frame is fresh
      await new Promise((resolve) => setTimeout(resolve, 200));

      const detection = await faceApi
        .detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        throw new Error("No face detected. Please ensure your face is clearly visible and look straight at the camera.");
      }

      setRegisterStatus("Uploading profile...");

      // Send face descriptor to user API
      const response = await fetch(`/api/users/${employee.id}/face`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          descriptor: Array.from(detection.descriptor),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to register face template.");
      }

      setRegisterStatus("Face profile registered!");
      stopCamera();
      
      setTimeout(() => {
        onRegisterSuccess();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "An error occurred during registration.");
      setRegisterStatus("Capture failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Remove face registration
  async function handleDeleteFace() {
    if (!window.confirm("Remove registered face profile for this employee? Face login will no longer work for them.")) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/users/${employee.id}/face`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete face profile.");
      }

      onRegisterSuccess();
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-sm mx-auto">
      {hasFace ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 mb-4 scale-up">
            <CheckCircle2 size={32} />
          </div>
          <h4 className="text-lg font-semibold text-black">Face Registered</h4>
          <p className="text-sm text-fog mt-2 max-w-xs">
            {employee.name} has a face recognition profile configured for biometric login.
          </p>

          <div className="flex gap-3 mt-6 w-full">
            <Button
              variant="secondary"
              type="button"
              className="flex-1"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              variant="ghost"
              type="button"
              className="text-red-600 hover:bg-red-50"
              disabled={isSubmitting}
              onClick={handleDeleteFace}
            >
              <Trash2 size={15} className="mr-1" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          {!modelsLoaded ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
              <RefreshCw className="animate-spin text-fog" size={32} />
              <div>
                <p className="text-sm font-semibold text-black">Starting Camera module...</p>
                <p className="text-xs text-fog mt-1 max-w-[280px]">
                  {loadingStatus || "Loading face tracker libraries..."}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center space-y-4">
              {/* Camera Preview */}
              <div className="relative w-full h-[225px] bg-black rounded-2xl overflow-hidden border-2 border-line shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover scale-x-[-1]"
                />

                {cameraActive && (
                  <div className="absolute inset-x-16 inset-y-8 border-2 border-dashed border-emerald-500/50 rounded-full pointer-events-none">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-400 opacity-60"></div>
                  </div>
                )}
              </div>

              {/* Status and Action Buttons */}
              <div className="w-full text-center space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mist border border-line text-xs font-semibold text-black">
                  <ScanFace size={13} className="text-black" />
                  <span>{registerStatus}</span>
                </div>

                {error && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2 text-center max-w-[320px] mx-auto">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-3">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => {
                      stopCamera();
                      onClose();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    disabled={isSubmitting || !cameraActive}
                    onClick={handleCapture}
                  >
                    <Camera size={15} className="mr-1.5" />
                    {isSubmitting ? "Capturing..." : "Capture & Save"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

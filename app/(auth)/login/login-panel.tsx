"use client";

import { ArrowRight, LockKeyhole, ShieldCheck, Camera, ScanFace, UserCheck, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

import { FieldGroup, FieldLabel, TextInput } from "@/components/forms/form-primitives";
import { seededCredentials } from "@/lib/data/seed-credentials";
import { Button } from "@/components/ui/button";
import type { ApiResponse, AuthUser } from "@/types";
import { loadFaceApi, loadModels } from "@/lib/face-loader";

export function LoginPanel() {
  const router = useRouter();
  
  // Standard login fields
  const [email, setEmail] = useState<string>(seededCredentials[0].email);
  const [password, setPassword] = useState<string>(seededCredentials[0].password);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login Mode: "password" | "face"
  const [loginMode, setLoginMode] = useState<"password" | "face">("password");

  // Face recognition states
  const [faceApi, setFaceApi] = useState<any>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [faceStatus, setFaceStatus] = useState("Position your face in the camera");
  const [faceError, setFaceError] = useState("");
  const [authSuccessUser, setAuthSuccessUser] = useState<AuthUser | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle standard password login
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = (await response.json()) as ApiResponse<AuthUser>;

      if (!response.ok || !result.success) {
        throw new Error(result.success ? "Login failed" : result.message);
      }

      router.push("/dashboard");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Load face-api.js models when selecting Face Mode
  useEffect(() => {
    if (loginMode !== "face") {
      stopCamera();
      return;
    }

    let active = true;
    async function initFaceApi() {
      try {
        setLoadingStatus("Initializing Face AI modules...");
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
          setFaceError("Could not load Face AI. Please use Password Login.");
        }
      }
    }

    initFaceApi();

    return () => {
      active = false;
      stopCamera();
    };
  }, [loginMode]);

  // Start webcam
  async function startCamera() {
    setFaceError("");
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
      setFaceError("Unable to access camera. Please allow camera permissions.");
    }
  }

  // Stop webcam
  function stopCamera() {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }

  // Real-time face detection loop
  useEffect(() => {
    if (!cameraActive || !modelsLoaded || !faceApi || !videoRef.current) return;

    const video = videoRef.current;
    
    // Set interval to perform face detection every 600ms
    detectionIntervalRef.current = setInterval(async () => {
      if (video.paused || video.ended) return;

      try {
        setFaceStatus("Scanning face...");
        
        // Detect single face with landmarks & descriptor
        const detection = await faceApi
          .detectSingleFace(video)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection) {
          // Face found!
          setFaceStatus("Authenticating...");
          
          // Stop detection interval temporarily
          if (detectionIntervalRef.current) {
            clearInterval(detectionIntervalRef.current);
            detectionIntervalRef.current = null;
          }

          // Send face descriptor to backend API
          const response = await fetch("/api/auth/face-login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              descriptor: Array.from(detection.descriptor),
            }),
          });

          const result = await response.json();

          if (response.ok && result.success) {
            // Authentication successful!
            setFaceStatus("Welcome back! Redirecting...");
            setAuthSuccessUser(result.data);
            stopCamera();
            
            // Redirect after brief delay
            setTimeout(() => {
              router.push("/dashboard");
              router.refresh();
            }, 1000);
          } else {
            // Face did not match or error occurred
            setFaceError(result.message || "Face not recognized. Try again.");
            setFaceStatus("Access denied");
            
            // Resume scanning after 2.5 seconds
            setTimeout(() => {
              if (loginMode === "face" && streamRef.current) {
                startScanningLoop();
              }
            }, 2500);
          }
        } else {
          setFaceStatus("Position your face inside the frame");
        }
      } catch (err) {
        console.error("Face detection error:", err);
      }
    }, 600);

    function startScanningLoop() {
      // Clear any existing scanner loops
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
      setFaceError("");
      setFaceStatus("Scanning face...");
      
      detectionIntervalRef.current = setInterval(async () => {
        if (!videoRef.current || videoRef.current.paused) return;
        try {
          const detection = await faceApi
            .detectSingleFace(videoRef.current)
            .withFaceLandmarks()
            .withFaceDescriptor();

          if (detection) {
            setFaceStatus("Authenticating...");
            if (detectionIntervalRef.current) {
              clearInterval(detectionIntervalRef.current);
              detectionIntervalRef.current = null;
            }

            const response = await fetch("/api/auth/face-login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ descriptor: Array.from(detection.descriptor) }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
              setFaceStatus("Welcome back! Redirecting...");
              setAuthSuccessUser(result.data);
              stopCamera();
              setTimeout(() => {
                router.push("/dashboard");
                router.refresh();
              }, 1000);
            } else {
              setFaceError(result.message || "Face not recognized. Try again.");
              setFaceStatus("Access denied");
              setTimeout(() => {
                if (loginMode === "face" && streamRef.current) {
                  startScanningLoop();
                }
              }, 2500);
            }
          } else {
            setFaceStatus("Position your face inside the frame");
          }
        } catch (e) {
          console.error(e);
        }
      }, 600);
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [cameraActive, modelsLoaded, faceApi, loginMode]);

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_0.95fr]">
      {/* Dynamic CSS scanner animation */}
      <style>{`
        @keyframes scan-animation {
          0% { transform: translateY(0); }
          50% { transform: translateY(220px); }
          100% { transform: translateY(0); }
        }
        .scan-line {
          animation: scan-animation 2.5s infinite linear;
        }
      `}</style>

      <section className="relative hidden overflow-hidden border-r border-line bg-mist lg:flex">
        <div className="grid-fade absolute inset-0" />
        <div className="relative z-10 flex flex-col justify-between p-12">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-fog">
              Probase Solutions
            </p>
            <h1 className="mt-6 max-w-xl text-5xl font-semibold tracking-tight">
              Premium control over people, revenue, and delivery.
            </h1>
            <p className="mt-5 max-w-lg text-base text-fog">
              Built for IT services operators who need a clean, executive-grade admin surface without operational noise.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="surface bg-white p-5">
              <ShieldCheck size={18} />
              <p className="mt-4 text-lg font-semibold">Face Attendance</p>
              <p className="mt-2 text-sm text-fog">
                Instant contactless face verification updates team rosters automatically.
              </p>
            </div>
            <div className="surface bg-white p-5">
              <LockKeyhole size={18} />
              <p className="mt-4 text-lg font-semibold">JWT session security</p>
              <p className="mt-2 text-sm text-fog">
                Secure cookie sessions for protected dashboard routes and APIs.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-fog">
              Command Access
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm text-fog">
              Sign in with password or use face recognition to mark attendance.
            </p>
          </div>

          {/* Mode Switcher Tab */}
          <div className="flex border-b border-line mb-6">
            <button
              onClick={() => setLoginMode("password")}
              className={`flex-1 pb-3 text-sm font-semibold tracking-wide border-b-2 transition ${
                loginMode === "password"
                  ? "border-black text-black"
                  : "border-transparent text-fog hover:text-black"
              }`}
            >
              Password Login
            </button>
            <button
              onClick={() => setLoginMode("face")}
              className={`flex-1 pb-3 text-sm font-semibold tracking-wide border-b-2 transition ${
                loginMode === "face"
                  ? "border-black text-black"
                  : "border-transparent text-fog hover:text-black"
              }`}
            >
              Face Attendance
            </button>
          </div>

          <div className="surface p-6 min-h-[340px] flex flex-col justify-between">
            {loginMode === "password" ? (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <FieldGroup>
                  <FieldLabel htmlFor="login-email">Email</FieldLabel>
                  <TextInput
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel htmlFor="login-password">Password</FieldLabel>
                  <TextInput
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </FieldGroup>
                {error ? (
                  <div className="rounded-[16px] border border-line bg-black px-4 py-3 text-sm text-white">
                    {error}
                  </div>
                ) : null}
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Signing in..." : "Enter Dashboard"}
                  <ArrowRight size={15} />
                </Button>
              </form>
            ) : (
              // Face recognition scanning panel
              <div className="flex flex-col items-center justify-center flex-1 py-2">
                {!modelsLoaded ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                    <RefreshCw className="animate-spin text-fog" size={32} />
                    <div>
                      <p className="text-sm font-semibold text-black">Loading Face Recognition</p>
                      <p className="text-xs text-fog mt-1 max-w-[280px]">
                        {loadingStatus || "Fetching models from CDN..."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center">
                    {/* Camera view container */}
                    <div className="relative w-[300px] h-[225px] bg-black rounded-2xl overflow-hidden border-2 border-line shadow-inner">
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover scale-x-[-1]"
                      />

                      {/* Diagnostic Scanning Lines */}
                      {cameraActive && !authSuccessUser && !faceError && (
                        <>
                          {/* Face Scanning Box Overlay */}
                          <div className="absolute inset-x-12 inset-y-6 border border-emerald-500/40 rounded-xl pointer-events-none">
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400"></div>
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400"></div>
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400"></div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400"></div>
                          </div>
                          {/* Animated scanner bar */}
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80 scan-line pointer-events-none"></div>
                        </>
                      )}

                      {/* Success Checkmark overlay */}
                      {authSuccessUser && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4">
                          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-3 scale-up animate-bounce">
                            <UserCheck size={32} className="text-white" />
                          </div>
                          <p className="font-semibold text-center text-base">{authSuccessUser.name}</p>
                          <p className="text-xs text-emerald-400 mt-1 uppercase tracking-wider">Attendance Marked!</p>
                        </div>
                      )}
                    </div>

                    {/* Status details */}
                    <div className="w-full text-center mt-5">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mist border border-line text-xs font-medium text-black">
                        <ScanFace size={13} className="text-black" />
                        <span>{faceStatus}</span>
                      </div>

                      {faceError && (
                        <div className="mt-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2 text-center max-w-[320px] mx-auto animate-pulse">
                          {faceError}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 rounded-[18px] border border-line bg-mist p-5 text-sm text-fog">
            <p className="font-semibold text-black">Seeded credentials</p>
            {seededCredentials.map((credential, index) => (
              <p key={credential.email} className={index === 0 ? "mt-2" : "mt-1"}>
                {credential.label}: `{credential.email}` / `{credential.password}`
              </p>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

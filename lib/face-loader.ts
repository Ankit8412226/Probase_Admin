/**
 * Helper to dynamically load face-api.js only on the client side.
 * This prevents build-time SSR errors in Next.js.
 */
export async function loadFaceApi() {
  if (typeof window === "undefined") {
    return null;
  }
  const faceapi = await import("face-api.js");
  return faceapi;
}

export async function loadModels(faceapi: any, onProgress?: (msg: string) => void) {
  const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models";
  
  try {
    if (!faceapi.nets.ssdMobilenetv1.isLoaded) {
      onProgress?.("Loading face detector model...");
      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
    }
    if (!faceapi.nets.faceLandmark68Net.isLoaded) {
      onProgress?.("Loading facial landmark model...");
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    }
    if (!faceapi.nets.faceRecognitionNet.isLoaded) {
      onProgress?.("Loading recognition network...");
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    }
    onProgress?.("Models ready");
    return true;
  } catch (error) {
    console.error("Failed to load face-api models:", error);
    onProgress?.("Error loading AI models");
    throw error;
  }
}

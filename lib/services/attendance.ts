import Attendance from "@/models/Attendance";
import User from "@/models/User";
import Employee from "@/models/Employee";
import { createId } from "@/lib/utils";
import { ensureDatabase, mapDocument, useMemoryStore } from "@/lib/services/helpers";
import { getMemoryStore } from "@/lib/services/store";
import type { AttendanceRecord } from "@/types";

import { getShifts } from "@/lib/services/shifts";
import { sendWhatsappAlert } from "@/lib/services/whatsapp";

export async function getAttendances() {
  if (useMemoryStore()) {
    return [...(getMemoryStore().attendances || [])].sort((a, b) => b.loginTime.localeCompare(a.loginTime));
  }

  await ensureDatabase();
  const attendances = await Attendance.find().sort({ loginTime: -1 }).lean();
  return attendances.map((item) => mapDocument(item as unknown as { _id: string } & AttendanceRecord));
}

export async function markAttendance(
  userId: string,
  userName: string,
  userRole: string,
  method: "face" | "password"
) {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const loginTimeStr = now.toISOString();

  // Determine status: check user's assigned shift start time
  let status: "Present" | "Late" = "Present";
  try {
    const shifts = await getShifts();
    const userShift = shifts.find((s) => s.assignedEmployeeIds.includes(userId));
    
    // Get check-in time converted to Indian Standard Time (IST)
    const istDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const hours = istDate.getHours();
    const minutes = istDate.getMinutes();

    if (userShift) {
      const [shours, sminutes] = userShift.startTime.split(":").map(Number);
      // Late threshold: exactly 15 minutes after shift start time
      const shiftStartTimeLimit = shours * 60 + sminutes + 15;
      const currentMinutesToday = hours * 60 + minutes;
      status = currentMinutesToday > shiftStartTimeLimit ? "Late" : "Present";
    } else {
      // Default fallback: Late if after 10:00 AM local time
      status = hours > 10 || (hours === 10 && minutes > 0) ? "Late" : "Present";
    }
  } catch (err) {
    try {
      const istDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      const hours = istDate.getHours();
      const minutes = istDate.getMinutes();
      status = hours > 10 || (hours === 10 && minutes > 0) ? "Late" : "Present";
    } catch {
      const hours = now.getHours();
      const minutes = now.getMinutes();
      status = hours > 10 || (hours === 10 && minutes > 0) ? "Late" : "Present";
    }
  }

  // Check if already checked in today
  if (useMemoryStore()) {
    const store = getMemoryStore();
    const existing = store.attendances?.find(
      (a) => a.userId === userId && a.date === dateStr
    );
    if (existing) {
      return existing;
    }

    const record: AttendanceRecord = {
      id: createId("att"),
      userId,
      userName,
      userRole: userRole as any,
      date: dateStr,
      loginTime: loginTimeStr,
      method,
      status,
      createdAt: loginTimeStr,
      updatedAt: loginTimeStr,
    };
    store.attendances = store.attendances || [];
    store.attendances.unshift(record);

    // Trigger WhatsApp check-in alert
    sendWhatsappAlert(
      userName,
      "+919999999999",
      `👋 Hello ${userName}, your attendance for today (${dateStr}) has been marked as ${status === "Present" ? "On Time" : "Late"} (Checked in via ${method}).`,
      "attendance"
    ).catch((err) => console.error("WhatsApp trigger failed:", err));

    return record;
  }

  await ensureDatabase();
  const existingDoc = await Attendance.findOne({ userId, date: dateStr }).lean();
  if (existingDoc) {
    return mapDocument(existingDoc as unknown as { _id: string } & AttendanceRecord);
  }

  const recordId = createId("att");
  const newRecord = {
    _id: recordId,
    userId,
    userName,
    userRole,
    date: dateStr,
    loginTime: loginTimeStr,
    method,
    status,
  };

  const created = await Attendance.create(newRecord);
  const mapped = mapDocument(created.toObject() as unknown as { _id: string } & AttendanceRecord);

  // Trigger WhatsApp check-in alert
  sendWhatsappAlert(
    userName,
    "+919999999999",
    `👋 Hello ${userName}, your attendance for today (${dateStr}) has been marked as ${status === "Present" ? "On Time" : "Late"} (Checked in via ${method}).`,
    "attendance"
  ).catch((err) => console.error("WhatsApp trigger failed:", err));

  return mapped;
}

export async function updateFaceDescriptor(userId: string, descriptor: number[]) {
  if (useMemoryStore()) {
    const store = getMemoryStore();
    const user = store.users.find((u) => u.id === userId);
    if (user) {
      user.faceDescriptor = descriptor;
    }
    const emp = store.employees.find((e) => e.id === userId);
    if (emp) {
      emp.faceDescriptor = descriptor;
    }
    return true;
  }

  await ensureDatabase();
  await User.findByIdAndUpdate(userId, { faceDescriptor: descriptor });
  await Employee.findByIdAndUpdate(userId, { faceDescriptor: descriptor });
  return true;
}

export async function deleteFaceDescriptor(userId: string) {
  if (useMemoryStore()) {
    const store = getMemoryStore();
    const user = store.users.find((u) => u.id === userId);
    if (user) {
      delete user.faceDescriptor;
    }
    const emp = store.employees.find((e) => e.id === userId);
    if (emp) {
      delete emp.faceDescriptor;
    }
    return true;
  }

  await ensureDatabase();
  await User.findByIdAndUpdate(userId, { $unset: { faceDescriptor: "" } });
  await Employee.findByIdAndUpdate(userId, { $unset: { faceDescriptor: "" } });
  return true;
}

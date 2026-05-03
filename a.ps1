param(
    [string]$SourceDir = (Get-Location)
)

Write-Host "Creating frontend files..."

function Write-File($path, $content) {
    $fullPath = Join-Path $SourceDir $path
    $dir = Split-Path -Parent $fullPath

    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    Set-Content -Path $fullPath -Value $content -Encoding UTF8 -Force
    Write-Host "[OK] $path"
}

# =========================
# AXIOS
# =========================
Write-File "src/api/axios.js" @'
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
'@

# =========================
# BUTTON
# =========================
Write-File "src/components/Button.jsx" @'
export default function Button({
  children,
  variant = "primary",
  loading = false,
  disabled = false,
  type = "button",
  onClick,
  className = "",
}) {
  const variants = {
    primary:
      "bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-400",
    secondary:
      "bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:bg-gray-200",
    outline:
      "border border-gray-300 text-gray-900 hover:bg-gray-50 disabled:opacity-50",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-gray-300 ${variants[variant]} ${className}`}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
'@

# =========================
# FORM INPUT
# =========================
Write-File "src/components/FormInput.jsx" @'
export default function FormInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required,
}) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-900 mb-2">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 ${
          error
            ? "border-red-600 focus:ring-red-600 bg-red-50"
            : "border-gray-300 focus:ring-gray-900 bg-white"
        }`}
      />

      {error && (
        <p className="text-red-600 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}
'@

# =========================
# COURSES API
# =========================
Write-File "src/api/courses.js" @'
import api from "./axios";

export const getCourses = () => api.get("/courses/");
export const getCourse = (slug) => api.get(`/courses/${slug}/`);
export const createCourse = (data) => api.post("/courses/create/", data);
export const updateCourse = (slug, data) => api.patch(`/courses/${slug}/`, data);
export const deleteCourse = (slug) => api.delete(`/courses/${slug}/`);
export const getMyCourses = () => api.get("/courses/my-courses/");
'@

# =========================
# ENROLLMENT API
# =========================
Write-File "src/api/enrollment.js" @'
import api from "./axios";

export const enroll = (courseId) =>
  api.post(`/enrollment/enroll/${courseId}/`);

export const unenroll = (courseId) =>
  api.delete(`/enrollment/unenroll/${courseId}/`);

export const getMyEnrollments = () =>
  api.get("/enrollment/my-enrollments/");

export const updateProgress = (lessonId, isCompleted) =>
  api.post(`/enrollment/progress/${lessonId}/`, {
    is_completed: isCompleted,
  });

export const getCourseProgress = (courseId) =>
  api.get(`/enrollment/progress/course/${courseId}/`);
'@

Write-Host ""
Write-Host "All clean files created successfully!"
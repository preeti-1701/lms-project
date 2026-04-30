import { Star, Users, Clock } from "lucide-react";

export default function CourseCard({ course, isEnrolled, onEnroll, onView, disabled }) {
  return (
    <div className="card cursor-pointer h-full flex flex-col">
      {/* Course Image Placeholder */}
      <div className="w-full h-40 bg-gradient-to-br from-primary to-accent flex items-center justify-center">
        <span className="text-white text-4xl font-bold opacity-50">{course.title.charAt(0)}</span>
      </div>

      {/* Course Content */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-lg text-secondary mb-2 line-clamp-2">{course.title}</h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">{course.description}</p>

        {/* Course Stats */}
        <div className="flex gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {course.total_hours} hours
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            4.8
          </div>
        </div>

        {/* Enrollment Status Badge */}
        {isEnrolled && (
          <div className="mb-3">
            <span className="badge badge-success text-xs">Enrolled</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-auto">
          {!isEnrolled ? (
            <button onClick={() => onEnroll(course.id)} disabled={disabled} className="flex-1 btn btn-primary text-sm">
              Enroll Now
            </button>
          ) : (
            <button onClick={() => onView(course.id)} className="flex-1 btn btn-outline text-sm">
              View Course
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

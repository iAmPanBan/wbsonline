import './CourseGrid.css';
import CourseTile from './CourseTile';

const CourseGrid = ({ courses }) => {
  return (
    <section className="course-grid">
      <div className="course-grid__header">
        <div>
          <p className="eyebrow">Course Catalog</p>
          <h2>Browse our most popular programs</h2>
          <p className="muted">Sourced from the Winfield Business School catalog API.</p>
        </div>
        <button className="btn btn--ghost">View all</button>
      </div>
      <div className="course-grid__items">
        {courses.map((course) => (
          <CourseTile key={course.id} course={course} />
        ))}
      </div>
    </section>
  );
};

export default CourseGrid;

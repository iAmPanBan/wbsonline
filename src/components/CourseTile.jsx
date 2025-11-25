const CourseTile = ({ course }) => {
  return (
    <article className="course-tile">
      <div className="course-tile__image">
        {course.image ? (
          <img src={course.image} alt={course.alt || course.title} loading="lazy" />
        ) : (
          <div className="course-tile__placeholder">No image</div>
        )}
      </div>
      <div className="course-tile__body">
        <p className="eyebrow">Digital Program</p>
        <h3>{course.title}</h3>
        {course.caption && <p className="muted" dangerouslySetInnerHTML={{ __html: course.caption }} />}
        {!course.caption && <p className="muted">Upcoming intake • Online • Flexible pace</p>}
        <button className="btn btn--link">View details →</button>
      </div>
    </article>
  );
};

export default CourseTile;

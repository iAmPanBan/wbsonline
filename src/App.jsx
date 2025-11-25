import Hero from './components/Hero';
import CourseGrid from './components/CourseGrid';
import { useApiData } from './hooks/useApiData';
import './styles/layout.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const App = () => {
  const { data: hero, loading: heroLoading, error: heroError } = useApiData(`${API_BASE}/hero`);
  const {
    data: courses,
    loading: coursesLoading,
    error: coursesError,
  } = useApiData(`${API_BASE}/courses`);

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <img src="/assets/img/logo.svg" alt="Winfield Business School" />
          <span>Winfield Business School</span>
        </div>
        <nav className="nav">
          <a href="#programs">Programs</a>
          <a href="#about">About</a>
          <a className="btn btn--primary" href="#apply">
            Apply Now
          </a>
        </nav>
      </header>

      <main className="content">
        {heroLoading && <p className="status">Loading hero...</p>}
        {heroError && <p className="status status--error">{heroError}</p>}
        {!heroLoading && !heroError && <Hero hero={hero} />}

        <section id="programs">
          {coursesLoading && <p className="status">Loading courses...</p>}
          {coursesError && <p className="status status--error">{coursesError}</p>}
          {!coursesLoading && !coursesError && <CourseGrid courses={courses} />}
        </section>
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Winfield Business School. Built with React & Node.js.</p>
      </footer>
    </div>
  );
};

export default App;

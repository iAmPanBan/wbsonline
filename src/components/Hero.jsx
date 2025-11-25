import './Hero.css';

const Hero = ({ hero }) => {
  if (!hero || hero.length === 0) return null;
  const item = hero[0];
  return (
    <section className="hero">
      <div className="hero__overlay">
        <div className="hero__content">
          <p className="hero__eyebrow">Welcome to Winfield Business School</p>
          <h1 className="hero__title">{item.title}</h1>
          {item.description && (
            <p className="hero__description" dangerouslySetInnerHTML={{ __html: item.description }} />
          )}
          <div className="hero__cta">
            <button className="btn btn--primary">Start Learning</button>
            <button className="btn">View Programs</button>
          </div>
        </div>
      </div>
      {item.image && <img src={item.image} alt={item.title} className="hero__image" />}
    </section>
  );
};

export default Hero;

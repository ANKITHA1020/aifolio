import { useState } from "react";
import ComponentErrorBoundary from "./ComponentErrorBoundary";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface Testimonial {
  name?: string;
  role?: string;
  company?: string;
  content?: string;
  image?: string;
  rating?: number;
}

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
  templateType: string;
  config?: Record<string, any>;
}

export default function TemplateTestimonialsCarousel({
  testimonials = [],
  templateType,
  config,
}: TestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <ComponentErrorBoundary componentName="Testimonials Carousel">
      <section id="section-testimonials_carousel" className={`testimonials-carousel testimonials-carousel-${templateType}`}>
        <div className="testimonials-carousel-container">
          <h2 className="testimonials-carousel-title">Testimonials</h2>
          <div className="testimonials-carousel-wrapper">
            <button
              className="testimonials-carousel-button testimonials-carousel-button-prev"
              onClick={prevTestimonial}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="testimonials-carousel-content">
              {currentTestimonial && (
                <div className="testimonials-carousel-item">
                  <Quote className="testimonials-carousel-quote-icon" />
                  {currentTestimonial.content && (
                    <p className="testimonials-carousel-text">
                      {currentTestimonial.content}
                    </p>
                  )}
                  <div className="testimonials-carousel-author">
                    {currentTestimonial.image && (
                      <img
                        src={currentTestimonial.image}
                        alt={currentTestimonial.name || "Author"}
                        className="testimonials-carousel-author-image"
                      />
                    )}
                    <div className="testimonials-carousel-author-info">
                      {currentTestimonial.name && (
                        <div className="testimonials-carousel-author-name">
                          {currentTestimonial.name}
                        </div>
                      )}
                      {(currentTestimonial.role || currentTestimonial.company) && (
                        <div className="testimonials-carousel-author-role">
                          {currentTestimonial.role}
                          {currentTestimonial.role && currentTestimonial.company && " at "}
                          {currentTestimonial.company}
                        </div>
                      )}
                      {currentTestimonial.rating && (
                        <div className="testimonials-carousel-rating">
                          {"★".repeat(currentTestimonial.rating)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button
              className="testimonials-carousel-button testimonials-carousel-button-next"
              onClick={nextTestimonial}
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
          <div className="testimonials-carousel-indicators">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                className={`testimonials-carousel-indicator ${
                  idx === currentIndex ? "active" : ""
                }`}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
    </ComponentErrorBoundary>
  );
}


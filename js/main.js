// main.js - JavaScript optimizado para Club Tucán

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.getElementById('nav-links');

if (mobileMenu) {
    mobileMenu.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
            mobileMenu.classList.remove('active');
        });
    });
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe elements for animation
const observeElements = document.querySelectorAll('.feature-card, .objective-item, .actividad-card');
observeElements.forEach(el => {
    observer.observe(el);
});

// Stagger animation delays for feature cards
document.querySelectorAll('.feature-card').forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.1}s`;
});

// Stagger animation delays for objective items
document.querySelectorAll('.objective-item').forEach((item, index) => {
    item.style.transitionDelay = `${index * 0.15}s`;
});

// Stagger animation delays for actividad cards
document.querySelectorAll('.actividad-card').forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.1}s`;
});

// Update copyright year
const yearElement = document.getElementById('current-year');
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

// Handle contact form submission
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    const formModal = document.getElementById('form-modal');
    const formModalTitle = document.getElementById('form-modal-title');
    const formModalMessage = document.getElementById('form-modal-message');
    const formModalClose = document.getElementById('form-modal-close');

    const openModal = (title, message) => {
        if (!formModal || !formModalTitle || !formModalMessage) return;
        formModalTitle.textContent = title;
        formModalMessage.textContent = message;
        formModal.classList.add('is-open');
        formModal.setAttribute('aria-hidden', 'false');
    };

    const closeModal = () => {
        if (!formModal) return;
        formModal.classList.remove('is-open');
        formModal.setAttribute('aria-hidden', 'true');
    };

    if (formModalClose) {
        formModalClose.addEventListener('click', closeModal);
    }

    if (formModal) {
        formModal.addEventListener('click', function(e) {
            if (e.target === formModal) closeModal();
        });
    }

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const submitButton = this.querySelector('button[type="submit"]');
        const originalButtonText = submitButton ? submitButton.textContent : '';

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Enviando...';
        }

        try {
            const formData = new FormData(this);
            const response = await fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) {
                throw new Error('No se pudo enviar el formulario.');
            }

            this.reset();
            openModal('Solicitud enviada', 'Gracias por tu interés. Nos pondremos en contacto contigo pronto.');
        } catch (error) {
            openModal('Error al enviar', 'Hubo un problema al enviar el formulario. Inténtalo de nuevo en unos minutos.');
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        }
    });
}

// main.js - Interacciones principales para Club Tucan

const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const escapeText = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const setBodyScroll = (enabled) => {
    document.body.style.overflow = enabled ? '' : 'hidden';
};

const initSmoothScroll = () => {
    qsa('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (event) => {
            const target = qs(anchor.getAttribute('href'));
            if (!target) return;

            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
};

const initNavbar = () => {
    const navbar = qs('#navbar');
    const mobileMenu = qs('#mobile-menu');
    const navLinks = qs('#nav-links');

    if (navbar) {
        const updateNavbar = () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        };

        updateNavbar();
        window.addEventListener('scroll', updateNavbar, { passive: true });
    }

    if (!mobileMenu || !navLinks) return;

    const setMenuOpen = (isOpen) => {
        navLinks.classList.toggle('active', isOpen);
        mobileMenu.classList.toggle('active', isOpen);
        mobileMenu.setAttribute('aria-expanded', String(isOpen));
        mobileMenu.setAttribute('aria-label', isOpen ? 'Cerrar menu' : 'Abrir menu');
    };

    mobileMenu.addEventListener('click', () => {
        setMenuOpen(!navLinks.classList.contains('active'));
    });

    qsa('a', navLinks).forEach(link => {
        link.addEventListener('click', () => setMenuOpen(false));
    });
};

const initActividades = () => {
    const actividadesGrid = qs('#actividades-grid');
    const actividadesData = qs('#actividades-data');

    if (!actividadesGrid || !actividadesData) return;

    try {
        const actividades = JSON.parse(actividadesData.textContent);

        actividadesGrid.innerHTML = actividades.map(actividad => {
            const contacto = actividad.contacto
                ? '<a href="index.html#contacto" class="btn-primary">Contactar</a>'
                : '';

            return `
                <div class="actividad-card">
                    <div class="actividad-image">
                        <img src="${escapeText(actividad.imagen)}" alt="${escapeText(actividad.alt || actividad.titulo)}" loading="lazy">
                    </div>
                    <div class="actividad-content">
                        <h3>${escapeText(actividad.titulo)}</h3>
                        ${actividad.dia ? `<p><strong>Día:</strong> ${escapeText(actividad.dia)}</p>` : ''}
                        ${actividad.hora ? `<p><strong>Hora:</strong> ${escapeText(actividad.hora)}</p>` : ''}
                        ${actividad.precio ? `<p><strong>Precio:</strong> ${escapeText(actividad.precio)}</p>` : ''}
                        ${contacto}
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        actividadesGrid.innerHTML = '<p>No se pudieron cargar las actividades.</p>';
    }
};

const initAnimations = () => {
    const animatedElements = qsa('.feature-card, .objective-item, .actividad-card');
    if (!animatedElements.length) return;

    animatedElements.forEach((element, index) => {
        const delay = element.classList.contains('objective-item') ? index * 0.15 : index * 0.1;
        element.style.transitionDelay = `${delay}s`;
    });

    if (!('IntersectionObserver' in window)) {
        animatedElements.forEach(element => element.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(element => observer.observe(element));
};

const initCurrentYear = () => {
    qsa('#current-year').forEach(element => {
        element.textContent = new Date().getFullYear();
    });
};

const initContactForm = () => {
    const contactForm = qs('#contact-form');
    if (!contactForm) return;

    const formModal = qs('#form-modal');
    const formModalTitle = qs('#form-modal-title');
    const formModalMessage = qs('#form-modal-message');
    const formModalClose = qs('#form-modal-close');

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

    formModalClose?.addEventListener('click', closeModal);
    formModal?.addEventListener('click', (event) => {
        if (event.target === formModal) closeModal();
    });

    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const submitButton = qs('button[type="submit"]', contactForm);
        const originalButtonText = submitButton?.textContent || '';

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Enviando...';
        }

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: new FormData(contactForm),
                headers: { Accept: 'application/json' }
            });

            if (!response.ok) throw new Error('No se pudo enviar el formulario.');

            contactForm.reset();
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
};

const initImageModal = () => {
    const imageModal = qs('#image-modal');
    const modalImage = qs('#modal-image');
    const closeButton = qs('.image-modal-close');
    // Only include activity images in the modal gallery.
    // Exclude news images (noticia-principal / noticia-card) to disable click-to-enlarge in Noticias.
    const galleryImages = qsa('.actividad-image img');

    if (!imageModal || !modalImage || !galleryImages.length) return;

    const closeModal = () => {
        imageModal.classList.remove('is-open');
        imageModal.setAttribute('aria-hidden', 'true');
        setBodyScroll(true);
    };

    galleryImages.forEach(image => {
        image.addEventListener('click', () => {
            modalImage.src = image.src;
            modalImage.alt = image.alt;
            imageModal.classList.add('is-open');
            imageModal.setAttribute('aria-hidden', 'false');
            setBodyScroll(false);
        });
    });

    closeButton?.addEventListener('click', closeModal);
    imageModal.addEventListener('click', (event) => {
        if (event.target === imageModal) closeModal();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && imageModal.classList.contains('is-open')) {
            closeModal();
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    initNavbar();
    initActividades();
    initAnimations();
    initCurrentYear();
    initContactForm();
    initImageModal();
});

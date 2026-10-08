document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Transparent navigation over image headers; solid navigation after scrolling.
    const navbar = document.getElementById("navbar");
    const alwaysSolid = navbar.classList.contains("scrolled");
    const updateNavbar = () => {
        navbar.classList.toggle("scrolled", alwaysSolid || window.scrollY > 50);
    };
    window.addEventListener("scroll", updateNavbar, { passive: true });
    updateNavbar();

    // 2. Intersection Observer for Fade-Up Animations
    // This gives the website that "luxury" feel where items smoothly appear as you scroll.
    const fadeElements = document.querySelectorAll(".fade-up");

    const appearOptions = {
        threshold: 0.15, // Trigger when 15% of the element is visible
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function(
        entries, 
        appearOnScroll
    ) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add("visible");
                appearOnScroll.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, appearOptions);

    fadeElements.forEach(element => {
        appearOnScroll.observe(element);
    });

    // 3. Mobile Menu Toggle
    const mobileBtn = document.querySelector(".mobile-menu-btn");
    const navLinks = document.querySelector(".nav-links");
    const mobileIcon = mobileBtn.querySelector("i");

    mobileBtn.addEventListener("click", () => {
        // Toggle the menu visibility
        navLinks.classList.toggle("active");
        mobileBtn.setAttribute("aria-expanded", String(navLinks.classList.contains("active")));
        mobileBtn.setAttribute("aria-label", navLinks.classList.contains("active") ? "Close navigation" : "Open navigation");
        
        // Toggle the icon from hamburger (bars) to a close button (X)
        if (navLinks.classList.contains("active")) {
            mobileIcon.classList.remove("fa-bars");
            mobileIcon.classList.add("fa-times");
        } else {
            mobileIcon.classList.remove("fa-times");
            mobileIcon.classList.add("fa-bars");
        }
    });

    // 4. Auto-Close Menu on Link Click
    // Ensures the menu closes automatically when a user clicks a link to navigate
    const menuLinks = document.querySelectorAll(".nav-links li a");
    
    menuLinks.forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
            mobileBtn.setAttribute("aria-expanded", "false");
            mobileBtn.setAttribute("aria-label", "Open navigation");
            mobileIcon.classList.remove("fa-times");
            mobileIcon.classList.add("fa-bars");
        });
    });

    // 5. Image Gallery Modal Logic (Popup)
    const modal = document.getElementById("imageModal");
    const expandedImg = document.getElementById("expandedImg");
    const captionText = document.getElementById("caption");
    const closeModal = document.querySelector(".close-modal");
    const galleryItems = document.querySelectorAll(".ig-item");

    if (modal && expandedImg && closeModal && galleryItems.length > 0) {
        galleryItems.forEach(item => {
            item.addEventListener("click", function() {
                const img = this.querySelector(".gallery-img");
                if (img) {
                    // Force the popup to open directly via inline styles
                    modal.style.display = "block";
                    expandedImg.src = img.src;
                    captionText.innerHTML = img.alt;
                    document.body.style.overflow = "hidden"; 
                }
            });
        });

        // Close modal when clicking the X
        closeModal.addEventListener("click", () => {
            modal.style.display = "none";
            document.body.style.overflow = "auto"; 
        });

        // Close modal when clicking the dark background outside the image
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.style.display = "none";
                document.body.style.overflow = "auto";
            }
        });
    }
});

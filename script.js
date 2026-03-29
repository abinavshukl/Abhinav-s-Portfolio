// We add this class immediately so CSS can tell whether JavaScript is active.
// This prevents animated elements from staying hidden if the script never loads.
document.documentElement.classList.add("js-enabled");

// Browsers may restore the last scroll position after refresh or redeploy preview opens.
// For a portfolio landing page, a normal visit should start at the hero section unless a hash was requested.
if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
}

// Grab the main elements once and reuse them later.
// This keeps the code faster and easier to read than querying the DOM repeatedly.
const yearElement = document.getElementById("year");
const navbar = document.getElementById("navbar");
const mobileBtn = document.getElementById("mobile-menu-btn");
const navLinksContainer = document.getElementById("nav-links");
const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll("main section[id]");
const revealElements = document.querySelectorAll(".reveal");

// Start at the top when there is no section hash in the URL.
// If someone intentionally opens a link like #projects, we leave that behavior alone.
const resetInitialScroll = () => {
    if (!window.location.hash) {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
};

// Put the current year into the footer automatically.
// This way the portfolio stays updated without editing the file every year.
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

// Hide the mobile menu and tell assistive technology that it is closed.
// ARIA attributes help screen-reader users understand the menu state.
const closeMobileMenu = () => {
    if (!navLinksContainer || !mobileBtn) return;

    navLinksContainer.classList.add("hidden");
    mobileBtn.setAttribute("aria-expanded", "false");
};

// Show the mobile menu and update the accessibility state to "open".
const openMobileMenu = () => {
    if (!navLinksContainer || !mobileBtn) return;

    navLinksContainer.classList.remove("hidden");
    mobileBtn.setAttribute("aria-expanded", "true");
};

// On small screens, this button works like a toggle:
// if the menu is hidden, show it; if it is open, hide it.
if (mobileBtn && navLinksContainer) {
    mobileBtn.addEventListener("click", () => {
        const isHidden = navLinksContainer.classList.contains("hidden");

        if (isHidden) {
            openMobileMenu();
        } else {
            closeMobileMenu();
        }
    });
}

// When a visitor taps a nav link on mobile, close the menu immediately.
// Otherwise the menu would stay open on top of the section they selected.
navItems.forEach((item) => {
    item.addEventListener("click", () => {
        if (window.innerWidth < 768) {
            closeMobileMenu();
        }
    });
});

// When the screen size changes, we reset the menu so it matches the layout.
// Desktop should always show the links, while mobile returns to the closed state.
window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) {
        navLinksContainer?.classList.remove("hidden");
        mobileBtn?.setAttribute("aria-expanded", "false");
    } else {
        closeMobileMenu();
    }
});

// Pressing Escape should close the mobile menu.
// This is a common keyboard behavior and improves accessibility.
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeMobileMenu();
    }
});

// After the user scrolls down a little, make the navbar more solid and compact.
// This improves contrast and keeps the navigation readable over page content.
const updateNavbarStyle = () => {
    if (!navbar) return;

    if (window.scrollY > 40) {
        navbar.classList.add("bg-slate-900/90", "backdrop-blur-md", "border-b", "border-slate-800", "py-4");
        navbar.classList.remove("bg-transparent", "py-6");
    } else {
        navbar.classList.remove("bg-slate-900/90", "backdrop-blur-md", "border-b", "border-slate-800", "py-4");
        navbar.classList.add("bg-transparent", "py-6");
    }
};

// Figure out which section is currently closest to the top of the screen.
// Then highlight the matching nav link so users always know where they are.
const updateActiveNavItem = () => {
    let currentSection = "";

    // Loop through every section and check whether the scroll position falls inside it.
    // The offset values make the highlight switch a little before the section hits the exact top.
    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (window.scrollY >= sectionTop - 220 && window.scrollY < sectionTop + sectionHeight - 120) {
            currentSection = section.id;
        }
    });

    // Update the nav styles based on the section we found above.
    navItems.forEach((item) => {
        const isActive = item.getAttribute("href") === `#${currentSection}`;

        item.classList.toggle("text-cyan-400", isActive);
        item.classList.toggle("text-slate-400", !isActive);

        if (isActive) {
            item.setAttribute("aria-current", "page");
        } else {
            item.removeAttribute("aria-current");
        }
    });
};

// IntersectionObserver watches elements and tells us when they enter the viewport.
// We use it so reveal animations happen only when the user actually scrolls to that content.
if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                // Once an element becomes visible, give it the class that fades it in.
                // Then stop observing it because we only need the animation once.
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.15,
            rootMargin: "0px 0px -40px 0px",
        }
    );

    // Register every .reveal element with the observer.
    revealElements.forEach((element) => revealObserver.observe(element));
} else {
    // Fallback for browsers that do not support IntersectionObserver:
    // just show everything immediately instead of leaving it hidden.
    revealElements.forEach((element) => element.classList.add("is-visible"));
}

// "ticking" stops scroll code from running too many times per second.
// Scrolling fires events very frequently, so we group visual updates efficiently.
let ticking = false;
const handleScroll = () => {
    if (ticking) return;

    ticking = true;

    // requestAnimationFrame waits until the browser is ready to paint the next frame.
    // This makes scroll-driven UI updates smoother and avoids unnecessary work.
    window.requestAnimationFrame(() => {
        updateNavbarStyle();
        updateActiveNavItem();
        ticking = false;
    });
};

// Listen for scrolling and run the optimized scroll handler above.
window.addEventListener("scroll", handleScroll, { passive: true });

// pageshow also covers back/forward cache restores in some browsers.
window.addEventListener("load", resetInitialScroll);
window.addEventListener("pageshow", resetInitialScroll);

// Run these once on page load so the UI is correct even before the first scroll event.
updateNavbarStyle();
updateActiveNavItem();

// If the page opens directly on desktop width, make sure the menu links are visible.
if (window.innerWidth >= 768) {
    navLinksContainer?.classList.remove("hidden");
}

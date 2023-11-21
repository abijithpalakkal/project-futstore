// Toggle sidebar on smaller screens
document.querySelector('.navbar-toggler').addEventListener('click', function () {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('show');
});

// Highlight active sidebar link
const sidebarLinks = document.querySelectorAll('.nav-link');
sidebarLinks.forEach((link) => {
    link.addEventListener('click', function () {
        // Remove 'active' class from all links
        sidebarLinks.forEach((l) => {
            l.classList.remove('active');
        });

        // Add 'active' class to the clicked link
        link.classList.add('active');
    });
});